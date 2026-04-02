import {
  ffqKey,
  foodFrequencyCategories,
  getArrayValue,
  getNumberValue,
  getTextValue,
  isValuePresent,
  matrixKey,
  surveySections,
  type Option,
  type ResponseValue,
  type SurveyField,
  type SurveyResponses,
  ultraProcessedItems,
} from "@/lib/survey";

export type ConditionOperator = "equals" | "not_equals" | "includes";

export type SurveyConditionRule = {
  fieldKey: string;
  operator: ConditionOperator;
  value: string;
};

export type SurveyConditionGroup = {
  mode: "all" | "any";
  rules: SurveyConditionRule[];
};

export type AnalyticsRole =
  | "consent"
  | "age"
  | "gender"
  | "nationality"
  | "role"
  | "shift_type"
  | "height_cm"
  | "weight_kg"
  | "stool_type"
  | "sleep_bedtime"
  | "sleep_latency_minutes"
  | "sleep_wake_time"
  | "sleep_hours"
  | "sleep_problem_sleep_latency"
  | "sleep_problem_waking_early"
  | "sleep_problem_bathroom"
  | "sleep_problem_breathing"
  | "sleep_problem_snoring"
  | "sleep_problem_cold"
  | "sleep_problem_hot"
  | "sleep_problem_dreams"
  | "sleep_problem_pain"
  | "sleep_problem_other"
  | "sleep_quality"
  | "sleep_medication_use"
  | "daytime_sleepiness"
  | "daytime_functioning"
  | `custom:${string}`;

export type SurveyOptionDefinition = Option & {
  id: string;
};

export type SurveyMatrixRowDefinition = {
  id: string;
  key: string;
  label: string;
  analyticsRole?: AnalyticsRole;
};

type BaseFieldDefinition = {
  id: string;
  key: string;
  label: string;
  description?: string;
  required?: boolean;
  analyticsRole?: AnalyticsRole;
  visibility?: SurveyConditionGroup;
  requiredWhen?: SurveyConditionGroup;
};

export type TextFieldDefinition = BaseFieldDefinition & {
  type: "text" | "number" | "textarea" | "time";
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
};

export type RadioFieldDefinition = BaseFieldDefinition & {
  type: "radio";
  options: SurveyOptionDefinition[];
  columns?: 2 | 3 | 4;
};

export type CheckboxFieldDefinition = BaseFieldDefinition & {
  type: "checkbox";
  options: SurveyOptionDefinition[];
  columns?: 2 | 3 | 4;
  maxSelections?: number;
};

export type MatrixFieldDefinition = BaseFieldDefinition & {
  type: "matrix";
  rows: SurveyMatrixRowDefinition[];
  columns: SurveyOptionDefinition[];
};

export type SurveyFieldDefinition =
  | TextFieldDefinition
  | RadioFieldDefinition
  | CheckboxFieldDefinition
  | MatrixFieldDefinition;

export type SurveySectionDefinition = {
  id: string;
  key: string;
  eyebrow: string;
  title: string;
  description: string;
  type: "basic" | "ffq" | "upf";
  fields?: SurveyFieldDefinition[];
};

export type FfqItemDefinition = {
  id: string;
  key: string;
  label: string;
  helper?: string;
  portionHint: string;
};

export type FfqCategoryDefinition = {
  id: string;
  key: string;
  title: string;
  items: FfqItemDefinition[];
};

export type UpfItemDefinition = {
  id: string;
  key: string;
  group: string;
  foods: string;
  threshold: string;
};

export type SurveySchema = {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: string;
  sections: SurveySectionDefinition[];
  ffqCategories: FfqCategoryDefinition[];
  upfItems: UpfItemDefinition[];
};

export type SurveyVersionStatus = "draft" | "published" | "archived";

export type SurveyVersion = {
  id: string;
  versionNumber: number;
  status: SurveyVersionStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  schema: SurveySchema;
};

export type AdminResponseListItem = {
  id: string;
  createdAt: string;
  versionNumber: number | null;
  surveyVersionId: string | null;
  age: number | null;
  gender: string | null;
  role: string | null;
  shiftType: string | null;
  psqiScore: number | null;
  ultraProcessedYesCount: number | null;
  deletedAt: string | null;
};

export type AnalyticsFilterSet = {
  versionId?: string | null;
  gender?: string | null;
  role?: string | null;
  shiftType?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
};

export const DRAFT_STORAGE_PREFIX = "seafarer-nutrition-survey";

const DEFAULT_ANALYTICS_ROLE_BY_KEY: Record<string, AnalyticsRole> = {
  consent: "consent",
  age: "age",
  gender: "gender",
  nationality: "nationality",
  role: "role",
  shift_type: "shift_type",
  height_cm: "height_cm",
  weight_kg: "weight_kg",
  bristol_stool_type: "stool_type",
  sleep_bedtime: "sleep_bedtime",
  sleep_latency_minutes: "sleep_latency_minutes",
  sleep_wake_time: "sleep_wake_time",
  sleep_hours: "sleep_hours",
  sleep_quality: "sleep_quality",
  sleep_medication_use: "sleep_medication_use",
  daytime_sleepiness: "daytime_sleepiness",
  daytime_functioning: "daytime_functioning",
};

const DEFAULT_MATRIX_ROW_ANALYTICS_ROLES: Record<string, AnalyticsRole> = {
  [matrixKey("sleep_problems", "sleep_latency")]: "sleep_problem_sleep_latency",
  [matrixKey("sleep_problems", "waking_early")]: "sleep_problem_waking_early",
  [matrixKey("sleep_problems", "bathroom")]: "sleep_problem_bathroom",
  [matrixKey("sleep_problems", "breathing")]: "sleep_problem_breathing",
  [matrixKey("sleep_problems", "snoring")]: "sleep_problem_snoring",
  [matrixKey("sleep_problems", "cold")]: "sleep_problem_cold",
  [matrixKey("sleep_problems", "hot")]: "sleep_problem_hot",
  [matrixKey("sleep_problems", "dreams")]: "sleep_problem_dreams",
  [matrixKey("sleep_problems", "pain")]: "sleep_problem_pain",
  [matrixKey("sleep_problems", "other")]: "sleep_problem_other",
};

const DEFAULT_REQUIRED_WHEN_BY_KEY: Record<string, SurveyConditionGroup> = {
  gender_other: {
    mode: "all",
    rules: [{ fieldKey: "gender", operator: "equals", value: "other" }],
  },
  port_habit_change_note: {
    mode: "all",
    rules: [{ fieldKey: "port_habit_change", operator: "equals", value: "yes" }],
  },
  snack_reasons_other: {
    mode: "all",
    rules: [{ fieldKey: "snack_reasons", operator: "includes", value: "other" }],
  },
  cooking_methods_other: {
    mode: "all",
    rules: [{ fieldKey: "cooking_methods", operator: "includes", value: "other" }],
  },
  oil_type_other: {
    mode: "all",
    rules: [{ fieldKey: "oil_type", operator: "equals", value: "other" }],
  },
  preferred_snacks_other: {
    mode: "all",
    rules: [{ fieldKey: "preferred_snacks", operator: "includes", value: "other" }],
  },
  sleep_other_reason: {
    mode: "all",
    rules: [
      {
        fieldKey: matrixKey("sleep_problems", "other"),
        operator: "not_equals",
        value: "0",
      },
    ],
  },
};

const toId = (...parts: string[]) =>
  parts
    .join("__")
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

const createOptionDefinition = (fieldKey: string, option: Option): SurveyOptionDefinition => ({
  ...option,
  id: toId("option", fieldKey, option.value),
});

const createFieldDefinition = (
  sectionId: string,
  field: SurveyField,
): SurveyFieldDefinition => {
  const base = {
    id: toId("field", sectionId, field.key),
    key: field.key,
    label: field.label,
    description: field.description,
    required: field.required,
    analyticsRole: DEFAULT_ANALYTICS_ROLE_BY_KEY[field.key],
    requiredWhen: DEFAULT_REQUIRED_WHEN_BY_KEY[field.key],
  };

  if (field.type === "radio") {
    return {
      ...base,
      type: field.type,
      columns: field.columns,
      options: field.options.map((option) => createOptionDefinition(field.key, option)),
    };
  }

  if (field.type === "checkbox") {
    return {
      ...base,
      type: field.type,
      columns: field.columns,
      maxSelections: field.maxSelections,
      options: field.options.map((option) => createOptionDefinition(field.key, option)),
    };
  }

  if (field.type === "matrix") {
    return {
      ...base,
      type: field.type,
      rows: field.rows.map((row) => ({
        ...row,
        id: toId("row", field.key, row.key),
        analyticsRole: DEFAULT_MATRIX_ROW_ANALYTICS_ROLES[matrixKey(field.key, row.key)],
      })),
      columns: field.columns.map((option) => createOptionDefinition(field.key, option)),
    };
  }

  return {
    ...base,
    type: field.type,
    placeholder: field.placeholder,
    min: field.min,
    max: field.max,
    step: field.step,
  };
};

export const createDefaultSurveySchema = (): SurveySchema => ({
  id: "core-survey",
  title: "Gemicilerde Beslenme ve Uyku Kalitesi Anketi",
  description:
    "Bu form, denizcilik sektöründe çalışan bireylerin beslenme alışkanlıkları ve uyku kalitesi üzerine yürütülen akademik bir araştırma kapsamında hazırlanmıştır. Tüm yanıtlar anonimdir.",
  estimatedMinutes: "12-18",
  sections: surveySections.map((section) => ({
    id: toId("section", section.id),
    key: section.id,
    eyebrow: section.eyebrow,
    title: section.title,
    description: section.description,
    type: section.type,
    fields: section.fields?.map((field) => createFieldDefinition(section.id, field)),
  })),
  ffqCategories: foodFrequencyCategories.map((category) => ({
    id: toId("ffq-category", category.id),
    key: category.id,
    title: category.title,
    items: category.items.map((item) => ({
      ...item,
      id: toId("ffq-item", category.id, item.id),
      key: item.id,
    })),
  })),
  upfItems: ultraProcessedItems.map((item) => ({
    ...item,
    id: toId("upf-item", item.id),
    key: item.id,
  })),
});

export const cloneSurveySchema = (schema: SurveySchema) =>
  JSON.parse(JSON.stringify(schema)) as SurveySchema;

export const createEditorId = (prefix: string) => {
  const random = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}-${random}`;
};

export const getDraftStorageKey = (versionId: string) =>
  `${DRAFT_STORAGE_PREFIX}:draft:${versionId}`;

export const evaluateConditionGroup = (
  condition: SurveyConditionGroup | undefined,
  responses: SurveyResponses,
) => {
  if (!condition || condition.rules.length === 0) {
    return true;
  }

  const evaluateRule = (rule: SurveyConditionRule) => {
    const currentValue = responses[rule.fieldKey];

    if (rule.operator === "includes") {
      return Array.isArray(currentValue) && currentValue.includes(rule.value);
    }

    const textValue = Array.isArray(currentValue)
      ? currentValue.join(",")
      : currentValue?.toString().trim() ?? "";

    if (rule.operator === "equals") {
      return textValue === rule.value;
    }

    return textValue !== rule.value;
  };

  return condition.mode === "all"
    ? condition.rules.every(evaluateRule)
    : condition.rules.some(evaluateRule);
};

export const fieldIsVisible = (field: SurveyFieldDefinition, responses: SurveyResponses) =>
  evaluateConditionGroup(field.visibility, responses);

export const fieldIsRequired = (field: SurveyFieldDefinition, responses: SurveyResponses) =>
  Boolean(field.required) || evaluateConditionGroup(field.requiredWhen, responses);

const formatMissingFieldMessage = (label: string) => `"${label}" alanını doldurun.`;

const getFieldValidationMessage = (
  field: SurveyFieldDefinition,
  responses: SurveyResponses,
): string | null => {
  if (!fieldIsVisible(field, responses)) {
    return null;
  }

  const required = fieldIsRequired(field, responses);
  if (!required) {
    return null;
  }

  if (field.type === "matrix") {
    const missingRow = field.rows.find(
      (row) => !isValuePresent(responses[matrixKey(field.key, row.key)]),
    );
    return missingRow
      ? `"${field.label}" bölümünde "${missingRow.label}" satırını doldurun.`
      : null;
  }

  if (field.type === "checkbox") {
    const selected = getArrayValue(responses, field.key);
    return selected.length > 0 ? null : `"${field.label}" sorusunda en az bir seçim yapın.`;
  }

  return isValuePresent(responses[field.key]) ? null : formatMissingFieldMessage(field.label);
};

export const getSectionValidationMessage = (
  schema: SurveySchema,
  section: SurveySectionDefinition,
  responses: SurveyResponses,
): string | null => {
  if (section.type === "ffq") {
    for (const category of schema.ffqCategories) {
      for (const item of category.items) {
        const frequency = getTextValue(responses, ffqKey(item.key, "frequency"));
        const portion = getTextValue(responses, ffqKey(item.key, "portion"));
        if (!frequency) return `"${item.label}" için tüketim sıklığını seçin.`;
        if (frequency !== "never" && !portion)
          return `"${item.label}" için bir seferde tüketilen miktarı yazın.`;
      }
    }
    return null;
  }

  if (section.type === "upf") {
    const missingItem = schema.upfItems.find(
      (item) => !isValuePresent(responses[upfKey(item.key)]),
    );
    return missingItem ? `"${missingItem.group}" için Evet/Hayır seçimi yapın.` : null;
  }

  for (const field of section.fields ?? []) {
    const message = getFieldValidationMessage(field, responses);
    if (message) {
      return message;
    }
  }

  const consentKey = getFieldKeyByAnalyticsRole(schema, "consent");
  if (section.key === "participant" && consentKey && getTextValue(responses, consentKey) !== "yes") {
    return "Yanıtları kaydetmek için anonim araştırma kullanım onayı gereklidir.";
  }

  return null;
};

export const sectionIsComplete = (
  schema: SurveySchema,
  section: SurveySectionDefinition,
  responses: SurveyResponses,
) => getSectionValidationMessage(schema, section, responses) === null;

const walkFields = (schema: SurveySchema) =>
  schema.sections.flatMap((section) =>
    (section.fields ?? []).map((field) => ({
      section,
      field,
    })),
  );

export const getFieldKeyByAnalyticsRole = (
  schema: SurveySchema,
  role: AnalyticsRole,
) => {
  for (const { field } of walkFields(schema)) {
    if (field.analyticsRole === role) {
      return field.key;
    }

    if (field.type === "matrix") {
      const row = field.rows.find((candidate) => candidate.analyticsRole === role);
      if (row) {
        return matrixKey(field.key, row.key);
      }
    }
  }

  return null;
};

const validateUniqueKeys = (values: string[], label: string, issues: string[]) => {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      issues.push(`Tekrarlanan ${label}: ${value}`);
      continue;
    }
    seen.add(value);
  }
};

export const validateSurveySchema = (schema: SurveySchema) => {
  const issues: string[] = [];

  if (!schema.title.trim()) issues.push("Form başlığı boş olamaz.");
  if (!schema.sections.length) issues.push("En az bir bölüm gerekli.");
  if (!schema.ffqCategories.length) issues.push("FFQ için en az bir kategori gerekli.");
  if (!schema.upfItems.length) issues.push("UPF için en az bir kayıt gerekli.");

  validateUniqueKeys(schema.sections.map((section) => section.key), "bölüm anahtarı", issues);

  const fieldKeys: string[] = [];

  for (const section of schema.sections) {
    if (!section.title.trim()) issues.push(`"${section.key}" bölüm başlığı boş olamaz.`);

    if (section.type === "basic") {
      if (!(section.fields?.length ?? 0)) {
        issues.push(`"${section.title}" bölümü en az bir alan içermeli.`);
      }

      for (const field of section.fields ?? []) {
        if (!field.key.trim()) issues.push(`"${section.title}" içinde boş alan anahtarı var.`);
        fieldKeys.push(field.key);

        if (field.type === "radio" || field.type === "checkbox") {
          if (!field.options.length) {
            issues.push(`"${field.label}" alanı en az bir seçenek içermeli.`);
          }
          validateUniqueKeys(
            field.options.map((option) => option.value),
            `"${field.label}" seçenek değeri`,
            issues,
          );
        }

        if (field.type === "matrix") {
          if (!field.rows.length || !field.columns.length) {
            issues.push(`"${field.label}" matrisi satır ve sütun içermeli.`);
          }
          validateUniqueKeys(
            field.rows.map((row) => row.key),
            `"${field.label}" satır anahtarı`,
            issues,
          );
          validateUniqueKeys(
            field.columns.map((column) => column.value),
            `"${field.label}" sütun değeri`,
            issues,
          );
        }
      }
    }
  }

  validateUniqueKeys(fieldKeys, "alan anahtarı", issues);
  validateUniqueKeys(
    schema.ffqCategories.map((category) => category.key),
    "FFQ kategori anahtarı",
    issues,
  );
  validateUniqueKeys(
    schema.ffqCategories.flatMap((category) => category.items.map((item) => item.key)),
    "FFQ besin anahtarı",
    issues,
  );
  validateUniqueKeys(
    schema.upfItems.map((item) => item.key),
    "UPF kayıt anahtarı",
    issues,
  );

  return issues;
};

export type SubmissionProfile = {
  participantCode: string | null;
  age: number | null;
  gender: string | null;
  genderOther: string | null;
  role: string | null;
  nationality: string | null;
  shiftType: string | null;
  seaServiceYears: number | null;
  seaServiceMonths: number | null;
  daysWithoutShore: number | null;
  heightCm: number | null;
  weightKg: number | null;
  consent: boolean;
  bmi: number | null;
};

export const calculateBodyMassIndex = (
  heightCm: number | null,
  weightKg: number | null,
) => {
  if (!heightCm || !weightKg) {
    return null;
  }

  const heightInMeters = heightCm / 100;
  const bmi = weightKg / (heightInMeters * heightInMeters);
  return Number.isFinite(bmi) ? Number(bmi.toFixed(1)) : null;
};

export const buildProfileFromResponses = (
  schema: SurveySchema,
  responses: SurveyResponses,
): SubmissionProfile => {
  const ageKey = getFieldKeyByAnalyticsRole(schema, "age");
  const genderKey = getFieldKeyByAnalyticsRole(schema, "gender");
  const nationalityKey = getFieldKeyByAnalyticsRole(schema, "nationality");
  const roleKey = getFieldKeyByAnalyticsRole(schema, "role");
  const shiftTypeKey = getFieldKeyByAnalyticsRole(schema, "shift_type");
  const heightKey = getFieldKeyByAnalyticsRole(schema, "height_cm");
  const weightKey = getFieldKeyByAnalyticsRole(schema, "weight_kg");
  const consentKey = getFieldKeyByAnalyticsRole(schema, "consent");

  const heightCm = heightKey ? getNumberValue(responses, heightKey) : null;
  const weightKg = weightKey ? getNumberValue(responses, weightKey) : null;

  return {
    participantCode: getTextValue(responses, "participant_code") || null,
    age: ageKey ? getNumberValue(responses, ageKey) : null,
    gender: genderKey ? getTextValue(responses, genderKey) || null : null,
    genderOther: getTextValue(responses, "gender_other") || null,
    role: roleKey ? getTextValue(responses, roleKey) || null : null,
    nationality: nationalityKey ? getTextValue(responses, nationalityKey) || null : null,
    shiftType: shiftTypeKey ? getTextValue(responses, shiftTypeKey) || null : null,
    seaServiceYears: getNumberValue(responses, "sea_service_years"),
    seaServiceMonths: getNumberValue(responses, "sea_service_months"),
    daysWithoutShore: getNumberValue(responses, "days_without_shore"),
    heightCm,
    weightKg,
    consent: consentKey ? getTextValue(responses, consentKey) === "yes" : false,
    bmi: calculateBodyMassIndex(heightCm, weightKg),
  };
};

const parseTimeToMinutes = (value: string) => {
  if (!value || !value.includes(":")) {
    return null;
  }

  const [hoursText, minutesText] = value.split(":");
  const hours = Number(hoursText);
  const minutes = Number(minutesText);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
};

const calculateSleepDurationComponent = (hours: number | null) => {
  if (hours === null) return null;
  if (hours > 7) return 0;
  if (hours >= 6) return 1;
  if (hours >= 5) return 2;
  return 3;
};

const calculateSleepLatencyComponent = (minutes: number | null, disturbance: number | null) => {
  if (minutes === null || disturbance === null) return null;

  let latencyScore = 0;
  if (minutes > 60) latencyScore = 3;
  else if (minutes >= 31) latencyScore = 2;
  else if (minutes >= 16) latencyScore = 1;

  const total = latencyScore + disturbance;

  if (total === 0) return 0;
  if (total <= 2) return 1;
  if (total <= 4) return 2;
  return 3;
};

const calculateSleepEfficiencyComponent = (
  bedtime: string,
  wakeTime: string,
  sleepHours: number | null,
) => {
  if (sleepHours === null) return null;

  const bedtimeMinutes = parseTimeToMinutes(bedtime);
  const wakeMinutes = parseTimeToMinutes(wakeTime);

  if (bedtimeMinutes === null || wakeMinutes === null) {
    return null;
  }

  let minutesInBed = wakeMinutes - bedtimeMinutes;
  if (minutesInBed <= 0) {
    minutesInBed += 24 * 60;
  }

  if (minutesInBed <= 0) {
    return null;
  }

  const efficiency = (sleepHours * 60) / minutesInBed;
  const percentage = efficiency * 100;

  if (percentage > 85) return 0;
  if (percentage >= 75) return 1;
  if (percentage >= 65) return 2;
  return 3;
};

const calculateSleepDisturbanceComponent = (values: Array<number | null>) => {
  if (values.some((value) => value === null)) {
    return null;
  }

  const total = values.reduce<number>((sum, value) => sum + (value ?? 0), 0);
  if (total === 0) return 0;
  if (total <= 9) return 1;
  if (total <= 18) return 2;
  return 3;
};

const calculateDaytimeDysfunctionComponent = (
  sleepiness: number | null,
  functioning: number | null,
) => {
  if (sleepiness === null || functioning === null) return null;
  const total = sleepiness + functioning;

  if (total === 0) return 0;
  if (total <= 2) return 1;
  if (total <= 4) return 2;
  return 3;
};

export const calculatePsqiScore = (
  schema: SurveySchema,
  responses: SurveyResponses,
) => {
  const subjectiveQualityKey = getFieldKeyByAnalyticsRole(schema, "sleep_quality");
  const sleepLatencyMinutesKey = getFieldKeyByAnalyticsRole(schema, "sleep_latency_minutes");
  const latencyDisturbanceKey = getFieldKeyByAnalyticsRole(schema, "sleep_problem_sleep_latency");
  const sleepHoursKey = getFieldKeyByAnalyticsRole(schema, "sleep_hours");
  const bedtimeKey = getFieldKeyByAnalyticsRole(schema, "sleep_bedtime");
  const wakeTimeKey = getFieldKeyByAnalyticsRole(schema, "sleep_wake_time");
  const medicationUseKey = getFieldKeyByAnalyticsRole(schema, "sleep_medication_use");
  const daytimeSleepinessKey = getFieldKeyByAnalyticsRole(schema, "daytime_sleepiness");
  const daytimeFunctioningKey = getFieldKeyByAnalyticsRole(schema, "daytime_functioning");
  const disturbanceKeys = [
    "sleep_problem_waking_early",
    "sleep_problem_bathroom",
    "sleep_problem_breathing",
    "sleep_problem_snoring",
    "sleep_problem_cold",
    "sleep_problem_hot",
    "sleep_problem_dreams",
    "sleep_problem_pain",
    "sleep_problem_other",
  ].map((role) => getFieldKeyByAnalyticsRole(schema, role as AnalyticsRole));

  const componentScores = [
    subjectiveQualityKey ? getNumberValue(responses, subjectiveQualityKey) : null,
    calculateSleepLatencyComponent(
      sleepLatencyMinutesKey ? getNumberValue(responses, sleepLatencyMinutesKey) : null,
      latencyDisturbanceKey ? getNumberValue(responses, latencyDisturbanceKey) : null,
    ),
    calculateSleepDurationComponent(
      sleepHoursKey ? getNumberValue(responses, sleepHoursKey) : null,
    ),
    calculateSleepEfficiencyComponent(
      bedtimeKey ? getTextValue(responses, bedtimeKey) : "",
      wakeTimeKey ? getTextValue(responses, wakeTimeKey) : "",
      sleepHoursKey ? getNumberValue(responses, sleepHoursKey) : null,
    ),
    calculateSleepDisturbanceComponent(
      disturbanceKeys.map((key) => (key ? getNumberValue(responses, key) : null)),
    ),
    medicationUseKey ? getNumberValue(responses, medicationUseKey) : null,
    calculateDaytimeDysfunctionComponent(
      daytimeSleepinessKey ? getNumberValue(responses, daytimeSleepinessKey) : null,
      daytimeFunctioningKey ? getNumberValue(responses, daytimeFunctioningKey) : null,
    ),
  ];

  if (componentScores.some((value) => value === null)) {
    return null;
  }

  return componentScores.reduce<number>((sum, value) => sum + (value ?? 0), 0);
};

export const calculateUltraProcessedCount = (
  schema: SurveySchema,
  responses: SurveyResponses,
) =>
  schema.upfItems.reduce((count, item) => {
    return count + (getTextValue(responses, upfKey(item.key)) === "yes" ? 1 : 0);
  }, 0);

export const normalizeResponseValue = (value: unknown): ResponseValue | null => {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
    return value;
  }

  return null;
};

export const normalizeResponseRecord = (input: Record<string, unknown>) => {
  const normalized: SurveyResponses = {};

  for (const [key, value] of Object.entries(input)) {
    const normalizedValue = normalizeResponseValue(value);
    if (normalizedValue !== null) {
      normalized[key] = normalizedValue;
    }
  }

  return normalized;
};

export const getChartableQuestions = (schema: SurveySchema) =>
  schema.sections.flatMap((section) => {
    if (section.type === "basic") {
      return (section.fields ?? []).filter(
        (field) => field.type === "radio" || field.type === "checkbox" || field.type === "matrix",
      );
    }

    return [];
  });

export type { ResponseValue, SurveyResponses } from "@/lib/survey";

export { ffqKey, getArrayValue, getNumberValue, getTextValue, isValuePresent, matrixKey };

export const upfKey = (itemKey: string) => `upf__${itemKey}`;
