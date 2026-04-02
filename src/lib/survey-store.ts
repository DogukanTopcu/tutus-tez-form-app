import "server-only";

import { frequencyOptions } from "@/lib/survey";
import {
  buildProfileFromResponses,
  calculatePsqiScore,
  calculateUltraProcessedCount,
  cloneSurveySchema,
  createDefaultSurveySchema,
  getChartableQuestions,
  getFieldKeyByAnalyticsRole,
  getTextValue,
  normalizeResponseRecord,
  type AdminResponseListItem,
  type AnalyticsFilterSet,
  type SurveyFieldDefinition,
  type SurveyResponses,
  type SurveySchema,
  type SurveyVersion,
  type SurveyVersionStatus,
  upfKey,
  validateSurveySchema,
} from "@/lib/survey-schema";
import { getSupabaseAdminClient } from "@/lib/supabase";

type SurveyVersionRow = {
  id: string;
  version_number: number;
  status: SurveyVersionStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  schema: SurveySchema;
};

type SurveyResponseRow = {
  id: string;
  created_at: string;
  updated_at: string | null;
  age: number | null;
  gender: string | null;
  nationality: string | null;
  role: string | null;
  shift_type: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  bmi: number | null;
  stool_type: number | null;
  psqi_score: number | null;
  ultra_processed_yes_count: number | null;
  consent_confirmed: boolean;
  source: string;
  profile: Record<string, unknown>;
  analytics: Record<string, unknown>;
  responses: Record<string, unknown>;
  survey_version_id: string | null;
  survey_snapshot: SurveySchema | null;
  deleted_at: string | null;
  deleted_by: string | null;
};

export type SurveyVersionMeta = {
  id: string;
  versionNumber: number;
  status: SurveyVersionStatus;
};

export type AdminResponseDetail = {
  id: string;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  age: number | null;
  gender: string | null;
  nationality: string | null;
  role: string | null;
  shiftType: string | null;
  bmi: number | null;
  stoolType: number | null;
  psqiScore: number | null;
  ultraProcessedYesCount: number | null;
  surveyVersionId: string | null;
  surveyVersionNumber: number | null;
  responses: SurveyResponses;
  surveySnapshot: SurveySchema;
  profile: Record<string, unknown>;
  analytics: Record<string, unknown>;
};

export type DistributionDatum = {
  label: string;
  value: number;
};

export type TimeSeriesDatum = {
  date: string;
  count: number;
};

export type QuestionChart = {
  id: string;
  label: string;
  type: "radio" | "checkbox" | "matrix" | "ffq" | "upf";
  data: DistributionDatum[];
};

export type AnalyticsPayload = {
  kpis: {
    totalResponses: number;
    averageAge: number | null;
    averageBodyMassIndex: number | null;
    averagePsqiScore: number | null;
    averageUpfCount: number | null;
  };
  submissionsOverTime: TimeSeriesDatum[];
  ageDistribution: DistributionDatum[];
  genderBreakdown: DistributionDatum[];
  roleBreakdown: DistributionDatum[];
  shiftTypeBreakdown: DistributionDatum[];
  bmiDistribution: DistributionDatum[];
  psqiDistribution: DistributionDatum[];
  stoolDistribution: DistributionDatum[];
  upfDistribution: DistributionDatum[];
  questionCharts: QuestionChart[];
  availableVersions: SurveyVersionMeta[];
};

const isDuplicateKeyError = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (error as { code?: string }).code === "23505";

const mapVersionRow = (row: SurveyVersionRow): SurveyVersion => ({
  id: row.id,
  versionNumber: row.version_number,
  status: row.status,
  publishedAt: row.published_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  createdBy: row.created_by,
  schema: row.schema,
});

const roundToOneDecimal = (value: number | null) =>
  value === null ? null : Number(value.toFixed(1));

const average = (values: Array<number | null>) => {
  const validValues = values.filter((value): value is number => value !== null);
  if (!validValues.length) {
    return null;
  }

  const total = validValues.reduce((sum, value) => sum + value, 0);
  return roundToOneDecimal(total / validValues.length);
};

const groupCounts = (values: string[]) => {
  const counts = new Map<string, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((left, right) => right.value - left.value || left.label.localeCompare(right.label, "tr"));
};

const buildTimeSeries = (rows: SurveyResponseRow[]) => {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const date = row.created_at.slice(0, 10);
    counts.set(date, (counts.get(date) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, count]) => ({ date, count }));
};

const ageBucketLabel = (value: number) => {
  if (value < 25) return "18-24";
  if (value < 35) return "25-34";
  if (value < 45) return "35-44";
  if (value < 55) return "45-54";
  return "55+";
};

const bmiBucketLabel = (value: number) => {
  if (value < 18.5) return "Zayıf";
  if (value < 25) return "Normal";
  if (value < 30) return "Fazla kilolu";
  return "Obezite";
};

const psqiBucketLabel = (value: number) => {
  if (value <= 4) return "0-4";
  if (value <= 9) return "5-9";
  if (value <= 14) return "10-14";
  return "15+";
};

const mapVersions = async () => {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("survey_versions")
    .select("id, version_number, status, published_at, created_at, updated_at, created_by, schema")
    .order("version_number", { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as SurveyVersionRow[]).map(mapVersionRow);
};

const backfillLegacyResponses = async (version: SurveyVersion) => {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("survey_responses")
    .update({
      survey_version_id: version.id,
      survey_snapshot: version.schema,
    })
    .is("survey_version_id", null);

  if (error) {
    throw error;
  }
};

export const ensureSurveyBootstrap = async () => {
  const existingVersions = await mapVersions();
  if (existingVersions.length > 0) {
    const fallbackVersion =
      existingVersions.find((version) => version.status === "published") ?? existingVersions[0];
    await backfillLegacyResponses(fallbackVersion);
    return existingVersions;
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("survey_versions")
    .insert({
      version_number: 1,
      status: "published",
      published_at: new Date().toISOString(),
      schema: createDefaultSurveySchema(),
    })
    .select("id, version_number, status, published_at, created_at, updated_at, created_by, schema")
    .single();

  if (error) {
    if (isDuplicateKeyError(error)) {
      const racedVersions = await mapVersions();
      if (racedVersions.length > 0) {
        const fallbackVersion =
          racedVersions.find((version) => version.status === "published") ?? racedVersions[0];
        await backfillLegacyResponses(fallbackVersion);
        return racedVersions;
      }
    }

    throw error;
  }

  const version = mapVersionRow(data as SurveyVersionRow);
  await backfillLegacyResponses(version);

  return [version];
};

export const getSurveyVersionMetas = async () => {
  const versions = await ensureSurveyBootstrap();
  return versions.map((version) => ({
    id: version.id,
    versionNumber: version.versionNumber,
    status: version.status,
  }));
};

export const getPublishedSurveyVersion = async () => {
  await ensureSurveyBootstrap();

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("survey_versions")
    .select("id, version_number, status, published_at, created_at, updated_at, created_by, schema")
    .eq("status", "published")
    .order("version_number", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    throw error;
  }

  return mapVersionRow(data as SurveyVersionRow);
};

export const getOrCreateDraftSurveyVersion = async (createdBy: string | null = null) => {
  await ensureSurveyBootstrap();

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("survey_versions")
    .select("id, version_number, status, published_at, created_at, updated_at, created_by, schema")
    .eq("status", "draft")
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data) {
    return mapVersionRow(data as SurveyVersionRow);
  }

  const published = await getPublishedSurveyVersion();
  const { data: inserted, error: insertError } = await supabase
    .from("survey_versions")
    .insert({
      version_number: published.versionNumber + 1,
      status: "draft",
      created_by: createdBy,
      schema: cloneSurveySchema(published.schema),
    })
    .select("id, version_number, status, published_at, created_at, updated_at, created_by, schema")
    .single();

  if (insertError) {
    if (isDuplicateKeyError(insertError)) {
      const { data: racedDraft, error: racedDraftError } = await supabase
        .from("survey_versions")
        .select("id, version_number, status, published_at, created_at, updated_at, created_by, schema")
        .eq("status", "draft")
        .order("version_number", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (racedDraftError) {
        throw racedDraftError;
      }

      if (racedDraft) {
        return mapVersionRow(racedDraft as SurveyVersionRow);
      }
    }

    throw insertError;
  }

  return mapVersionRow(inserted as SurveyVersionRow);
};

export const getSurveyVersionById = async (id: string) => {
  await ensureSurveyBootstrap();

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("survey_versions")
    .select("id, version_number, status, published_at, created_at, updated_at, created_by, schema")
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  return mapVersionRow(data as SurveyVersionRow);
};

export const saveDraftSurveySchema = async (schema: SurveySchema, userId: string) => {
  const issues = validateSurveySchema(schema);
  if (issues.length > 0) {
    throw new Error(issues.join("\n"));
  }

  const draft = await getOrCreateDraftSurveyVersion(userId);
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("survey_versions")
    .update({
      schema,
      updated_at: new Date().toISOString(),
      created_by: draft.createdBy ?? userId,
    })
    .eq("id", draft.id)
    .select("id, version_number, status, published_at, created_at, updated_at, created_by, schema")
    .single();

  if (error) {
    if (isDuplicateKeyError(error)) {
      const { data: publishedVersion, error: publishedVersionError } = await supabase
        .from("survey_versions")
        .select("id, version_number, status, published_at, created_at, updated_at, created_by, schema")
        .eq("status", "published")
        .order("version_number", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (publishedVersionError) {
        throw publishedVersionError;
      }

      if (publishedVersion) {
        return mapVersionRow(publishedVersion as SurveyVersionRow);
      }
    }

    throw error;
  }

  return mapVersionRow(data as SurveyVersionRow);
};

export const publishDraftSurveyVersion = async (userId: string) => {
  const supabase = getSupabaseAdminClient();
  const draft = await getOrCreateDraftSurveyVersion(userId);

  const currentPublished = await supabase
    .from("survey_versions")
    .select("id")
    .eq("status", "published")
    .maybeSingle();

  if (currentPublished.error) {
    throw currentPublished.error;
  }

  if (currentPublished.data?.id) {
    const { error: archiveError } = await supabase
      .from("survey_versions")
      .update({ status: "archived", updated_at: new Date().toISOString() })
      .eq("id", currentPublished.data.id);

    if (archiveError) {
      throw archiveError;
    }
  }

  const { data, error } = await supabase
    .from("survey_versions")
    .update({
      status: "published",
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: draft.createdBy ?? userId,
    })
    .eq("id", draft.id)
    .select("id, version_number, status, published_at, created_at, updated_at, created_by, schema")
    .single();

  if (error) {
    throw error;
  }

  return mapVersionRow(data as SurveyVersionRow);
};

export const buildSubmissionInsert = (
  schemaVersion: SurveyVersion,
  rawResponses: Record<string, unknown>,
) => {
  const responses = normalizeResponseRecord(rawResponses);
  const profile = buildProfileFromResponses(schemaVersion.schema, responses);
  const psqiScore = calculatePsqiScore(schemaVersion.schema, responses);
  const ultraProcessedYesCount = calculateUltraProcessedCount(schemaVersion.schema, responses);
  const stoolKey = getFieldKeyByAnalyticsRole(schemaVersion.schema, "stool_type");
  const stoolType = stoolKey ? Number(getTextValue(responses, stoolKey)) || null : null;

  return {
    responses,
    profile,
    insert: {
      age: profile.age,
      gender: profile.gender,
      nationality: profile.nationality,
      role: profile.role,
      shift_type: profile.shiftType,
      height_cm: profile.heightCm,
      weight_kg: profile.weightKg,
      bmi: profile.bmi,
      stool_type: stoolType,
      psqi_score: psqiScore,
      ultra_processed_yes_count: ultraProcessedYesCount,
      consent_confirmed: profile.consent,
      profile,
      analytics: {
        psqiScore,
        ultraProcessedYesCount,
        stoolType,
        bodyMassIndex: profile.bmi,
      },
      responses,
      source: "public-web",
      survey_version_id: schemaVersion.id,
      survey_snapshot: schemaVersion.schema,
    },
  };
};

const applyResponseFilters = (
  query: any,
  filters: AnalyticsFilterSet,
) => {
  let nextQuery = query.is("deleted_at", null);

  if (filters.versionId) {
    nextQuery = nextQuery.eq("survey_version_id", filters.versionId);
  }

  if (filters.gender) {
    nextQuery = nextQuery.eq("gender", filters.gender);
  }

  if (filters.role) {
    nextQuery = nextQuery.eq("role", filters.role);
  }

  if (filters.shiftType) {
    nextQuery = nextQuery.eq("shift_type", filters.shiftType);
  }

  if (filters.dateFrom) {
    nextQuery = nextQuery.gte("created_at", `${filters.dateFrom}T00:00:00.000Z`);
  }

  if (filters.dateTo) {
    nextQuery = nextQuery.lte("created_at", `${filters.dateTo}T23:59:59.999Z`);
  }

  return nextQuery;
};

const fetchResponseRows = async (filters: AnalyticsFilterSet = {}) => {
  const supabase = getSupabaseAdminClient();
  const baseQuery = supabase
    .from("survey_responses")
    .select(
      "id, created_at, updated_at, age, gender, nationality, role, shift_type, height_cm, weight_kg, bmi, stool_type, psqi_score, ultra_processed_yes_count, consent_confirmed, source, profile, analytics, responses, survey_version_id, survey_snapshot, deleted_at, deleted_by",
    )
    .order("created_at", { ascending: false });

  const { data, error } = await applyResponseFilters(baseQuery, filters);

  if (error) {
    throw error;
  }

  return (data ?? []) as SurveyResponseRow[];
};

export const listAdminResponses = async (filters: AnalyticsFilterSet = {}) => {
  const [rows, versions] = await Promise.all([fetchResponseRows(filters), getSurveyVersionMetas()]);
  const versionLookup = new Map(versions.map((version) => [version.id, version.versionNumber]));

  return rows.map<AdminResponseListItem>((row) => ({
    id: row.id,
    createdAt: row.created_at,
    versionNumber: row.survey_version_id ? (versionLookup.get(row.survey_version_id) ?? null) : null,
    surveyVersionId: row.survey_version_id,
    age: row.age,
    gender: row.gender,
    role: row.role,
    shiftType: row.shift_type,
    psqiScore: row.psqi_score,
    ultraProcessedYesCount: row.ultra_processed_yes_count,
    deletedAt: row.deleted_at,
  }));
};

export const getAdminResponseDetail = async (id: string) => {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("survey_responses")
    .select(
      "id, created_at, updated_at, age, gender, nationality, role, shift_type, bmi, stool_type, psqi_score, ultra_processed_yes_count, profile, analytics, responses, survey_version_id, survey_snapshot, deleted_at",
    )
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  const versions = await getSurveyVersionMetas();
  const versionLookup = new Map(versions.map((version) => [version.id, version.versionNumber]));
  const row = data as SurveyResponseRow;

  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
    age: row.age,
    gender: row.gender,
    nationality: row.nationality,
    role: row.role,
    shiftType: row.shift_type,
    bmi: row.bmi,
    stoolType: row.stool_type,
    psqiScore: row.psqi_score,
    ultraProcessedYesCount: row.ultra_processed_yes_count,
    surveyVersionId: row.survey_version_id,
    surveyVersionNumber: row.survey_version_id ? (versionLookup.get(row.survey_version_id) ?? null) : null,
    responses: normalizeResponseRecord(row.responses ?? {}),
    surveySnapshot: row.survey_snapshot ?? createDefaultSurveySchema(),
    profile: row.profile ?? {},
    analytics: row.analytics ?? {},
  } satisfies AdminResponseDetail;
};

export const softDeleteResponse = async (id: string, deletedBy: string) => {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("survey_responses")
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: deletedBy,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw error;
  }
};

const fieldOptionLabel = (field: SurveyFieldDefinition, value: string) => {
  if (field.type === "radio" || field.type === "checkbox") {
    return field.options.find((option) => option.value === value)?.label ?? value;
  }

  return value;
};

const buildQuestionCharts = (schema: SurveySchema, rows: SurveyResponseRow[]) => {
  const charts: QuestionChart[] = [];

  for (const field of getChartableQuestions(schema)) {
    if (field.type === "radio") {
      const data = groupCounts(
        rows
          .map((row) => getTextValue(normalizeResponseRecord(row.responses ?? {}), field.key))
          .filter(Boolean)
          .map((value) => fieldOptionLabel(field, value)),
      );

      if (data.length > 0) {
        charts.push({
          id: `question-${field.id}`,
          label: field.label,
          type: "radio",
          data,
        });
      }
    }

    if (field.type === "checkbox") {
      const data = groupCounts(
        rows.flatMap((row) => {
          const responses = normalizeResponseRecord(row.responses ?? {});
          const rawValue = responses[field.key];
          if (!Array.isArray(rawValue)) {
            return [];
          }
          return rawValue.map((value) => fieldOptionLabel(field, value));
        }),
      );

      if (data.length > 0) {
        charts.push({
          id: `question-${field.id}`,
          label: field.label,
          type: "checkbox",
          data,
        });
      }
    }

    if (field.type === "matrix") {
      for (const rowDefinition of field.rows) {
        const data = groupCounts(
          rows
            .map((row) =>
              getTextValue(
                normalizeResponseRecord(row.responses ?? {}),
                `${field.key}__${rowDefinition.key}`,
              ),
            )
            .filter(Boolean)
            .map((value) => field.columns.find((column) => column.value === value)?.label ?? value),
        );

        if (data.length > 0) {
          charts.push({
            id: `question-${field.id}-${rowDefinition.id}`,
            label: `${field.label} · ${rowDefinition.label}`,
            type: "matrix",
            data,
          });
        }
      }
    }
  }

  for (const category of schema.ffqCategories) {
    for (const item of category.items) {
      const data = groupCounts(
        rows
          .map((row) =>
            getTextValue(normalizeResponseRecord(row.responses ?? {}), `ffq__${item.key}__frequency`),
          )
          .filter(Boolean)
          .map(
            (value) => frequencyOptions.find((option) => option.value === value)?.label ?? value,
          ),
      );

      if (data.length > 0) {
        charts.push({
          id: `ffq-${item.id}`,
          label: `${category.title} · ${item.label}`,
          type: "ffq",
          data,
        });
      }
    }
  }

  for (const item of schema.upfItems) {
    const data = groupCounts(
      rows
        .map((row) => getTextValue(normalizeResponseRecord(row.responses ?? {}), upfKey(item.key)))
        .filter(Boolean)
        .map((value) => (value === "yes" ? "Evet" : value === "no" ? "Hayır" : value)),
    );

    if (data.length > 0) {
      charts.push({
        id: `upf-${item.id}`,
        label: item.group,
        type: "upf",
        data,
      });
    }
  }

  return charts;
};

export const getAnalyticsPayload = async (filters: AnalyticsFilterSet = {}) => {
  const [rows, availableVersions, fallbackSchema] = await Promise.all([
    fetchResponseRows(filters),
    getSurveyVersionMetas(),
    getPublishedSurveyVersion(),
  ]);

  const selectedSchema =
    filters.versionId && availableVersions.some((version) => version.id === filters.versionId)
      ? (await getSurveyVersionById(filters.versionId)).schema
      : fallbackSchema.schema;

  const ageDistribution = groupCounts(
    rows.map((row) => row.age).filter((value): value is number => value !== null).map(ageBucketLabel),
  );
  const genderBreakdown = groupCounts(rows.map((row) => row.gender ?? "Belirtilmedi"));
  const roleBreakdown = groupCounts(rows.map((row) => row.role ?? "Belirtilmedi")).slice(0, 12);
  const shiftTypeBreakdown = groupCounts(rows.map((row) => row.shift_type ?? "Belirtilmedi"));
  const bmiDistribution = groupCounts(
    rows.map((row) => row.bmi).filter((value): value is number => value !== null).map(bmiBucketLabel),
  );
  const psqiDistribution = groupCounts(
    rows
      .map((row) => row.psqi_score)
      .filter((value): value is number => value !== null)
      .map(psqiBucketLabel),
  );
  const stoolDistribution = groupCounts(
    rows
      .map((row) => row.stool_type)
      .filter((value): value is number => value !== null)
      .map((value) => `Tip ${value}`),
  );
  const upfDistribution = groupCounts(
    rows
      .map((row) => row.ultra_processed_yes_count)
      .filter((value): value is number => value !== null)
      .map((value) => `${value} evet`),
  );

  return {
    kpis: {
      totalResponses: rows.length,
      averageAge: average(rows.map((row) => row.age)),
      averageBodyMassIndex: average(rows.map((row) => row.bmi)),
      averagePsqiScore: average(rows.map((row) => row.psqi_score)),
      averageUpfCount: average(rows.map((row) => row.ultra_processed_yes_count)),
    },
    submissionsOverTime: buildTimeSeries(rows),
    ageDistribution,
    genderBreakdown,
    roleBreakdown,
    shiftTypeBreakdown,
    bmiDistribution,
    psqiDistribution,
    stoolDistribution,
    upfDistribution,
    questionCharts: buildQuestionCharts(selectedSchema, rows),
    availableVersions,
  } satisfies AnalyticsPayload;
};
