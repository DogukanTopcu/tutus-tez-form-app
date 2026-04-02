"use client";

import { useMemo, useState } from "react";

import { SurveyForm } from "@/components/SurveyForm";
import {
  cloneSurveySchema,
  createEditorId,
  validateSurveySchema,
  type AnalyticsRole,
  type CheckboxFieldDefinition,
  type FfqCategoryDefinition,
  type FfqItemDefinition,
  type MatrixFieldDefinition,
  type SurveyConditionGroup,
  type SurveyFieldDefinition,
  type SurveyOptionDefinition,
  type SurveySchema,
  type SurveySectionDefinition,
  type SurveyVersion,
  type UpfItemDefinition,
} from "@/lib/survey-schema";
import type { SurveyVersionMeta } from "@/lib/survey-store";

type AdminFormBuilderProps = {
  initialDraft: SurveyVersion;
  initialPublished: SurveyVersion;
  versions: SurveyVersionMeta[];
};

type SaveState = "idle" | "saving" | "publishing";

const clone = <T,>(value: T) => JSON.parse(JSON.stringify(value)) as T;

const createOption = (): SurveyOptionDefinition => ({
  id: createEditorId("option"),
  value: "new_option",
  label: "Yeni seçenek",
});

const createMatrixField = (): MatrixFieldDefinition => ({
  id: createEditorId("field"),
  key: "new_matrix",
  type: "matrix",
  label: "Yeni matris sorusu",
  required: false,
  rows: [
    { id: createEditorId("row"), key: "row_1", label: "Satır 1" },
    { id: createEditorId("row"), key: "row_2", label: "Satır 2" },
  ],
  columns: [
    { id: createEditorId("option"), value: "yes", label: "Evet" },
    { id: createEditorId("option"), value: "no", label: "Hayır" },
  ],
});

const createField = (
  type: SurveyFieldDefinition["type"] = "text",
): SurveyFieldDefinition => {
  if (type === "radio") {
    return {
      id: createEditorId("field"),
      key: "new_radio",
      type,
      label: "Yeni tek seçim",
      required: false,
      options: [createOption(), { ...createOption(), value: "option_2", label: "Seçenek 2" }],
      columns: 2,
    };
  }

  if (type === "checkbox") {
    return {
      id: createEditorId("field"),
      key: "new_checkbox",
      type,
      label: "Yeni çoklu seçim",
      required: false,
      options: [createOption(), { ...createOption(), value: "option_2", label: "Seçenek 2" }],
      columns: 2,
      maxSelections: 2,
    } satisfies CheckboxFieldDefinition;
  }

  if (type === "matrix") {
    return createMatrixField();
  }

  return {
    id: createEditorId("field"),
    key: `new_${type}`,
    type,
    label: "Yeni alan",
    required: false,
    placeholder: "İsteğe bağlı",
  };
};

const transformFieldType = (
  field: SurveyFieldDefinition,
  type: SurveyFieldDefinition["type"],
): SurveyFieldDefinition => {
  if (field.type === type) {
    return field;
  }

  const base = {
    id: field.id,
    key: field.key,
    label: field.label,
    description: field.description,
    required: field.required,
    analyticsRole: field.analyticsRole,
    requiredWhen: field.requiredWhen,
    visibility: field.visibility,
  };

  if (type === "radio") {
    return {
      ...base,
      type,
      options: [createOption(), { ...createOption(), value: "option_2", label: "Seçenek 2" }],
      columns: 2,
    };
  }

  if (type === "checkbox") {
    return {
      ...base,
      type,
      options: [createOption(), { ...createOption(), value: "option_2", label: "Seçenek 2" }],
      columns: 2,
      maxSelections: 2,
    };
  }

  if (type === "matrix") {
    const matrix = createMatrixField();
    return {
      ...base,
      type,
      rows: matrix.rows,
      columns: matrix.columns,
    };
  }

  return {
    ...base,
    type,
    placeholder: "İsteğe bağlı",
  };
};

const createSection = (): SurveySectionDefinition => ({
  id: createEditorId("section"),
  key: "new_section",
  eyebrow: "Yeni bölüm",
  title: "Yeni bölüm başlığı",
  description: "Bu bölüm admin panelden oluşturuldu.",
  type: "basic",
  fields: [createField("text")],
});

const createFfqItem = (): FfqItemDefinition => ({
  id: createEditorId("ffq-item"),
  key: "new_food",
  label: "Yeni besin",
  helper: "",
  portionHint: "Porsiyon",
});

const createFfqCategory = (): FfqCategoryDefinition => ({
  id: createEditorId("ffq-category"),
  key: "new_category",
  title: "Yeni kategori",
  items: [createFfqItem()],
});

const createUpfItem = (): UpfItemDefinition => ({
  id: createEditorId("upf-item"),
  key: "new_upf",
  group: "Yeni grup",
  foods: "Örnek ürünler",
  threshold: "Haftada 1 kez",
});

function ConditionEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: SurveyConditionGroup;
  onChange: (value: SurveyConditionGroup | undefined) => void;
}) {
  const rule = value?.rules[0];
  const enabled = Boolean(rule);

  return (
    <div className="admin-subcard">
      <div className="admin-inline">
        <span className="question-card__label">{label}</span>
        <label className="admin-switch">
          <input
            checked={enabled}
            type="checkbox"
            onChange={(event) => {
              if (!event.target.checked) {
                onChange(undefined);
                return;
              }

              onChange({
                mode: "all",
                rules: [{ fieldKey: "", operator: "equals", value: "" }],
              });
            }}
          />
          <span>{enabled ? "Aktif" : "Kapalı"}</span>
        </label>
      </div>

      {enabled && rule ? (
        <div className="admin-grid-two">
          <label className="question-card question-card--compact">
            <span className="question-card__label">Bağlı alan anahtarı</span>
            <input
              className="input-control"
              type="text"
              value={rule.fieldKey}
              onChange={(event) =>
                onChange({
                  mode: "all",
                  rules: [{ ...rule, fieldKey: event.target.value }],
                })
              }
            />
          </label>
          <label className="question-card question-card--compact">
            <span className="question-card__label">Operatör</span>
            <select
              className="select-control"
              value={rule.operator}
              onChange={(event) =>
                onChange({
                  mode: "all",
                  rules: [{ ...rule, operator: event.target.value as typeof rule.operator }],
                })
              }
            >
              <option value="equals">equals</option>
              <option value="not_equals">not_equals</option>
              <option value="includes">includes</option>
            </select>
          </label>
          <label className="question-card question-card--compact">
            <span className="question-card__label">Değer</span>
            <input
              className="input-control"
              type="text"
              value={rule.value}
              onChange={(event) =>
                onChange({
                  mode: "all",
                  rules: [{ ...rule, value: event.target.value }],
                })
              }
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}

function OptionListEditor({
  title,
  options,
  onChange,
}: {
  title: string;
  options: SurveyOptionDefinition[];
  onChange: (options: SurveyOptionDefinition[]) => void;
}) {
  return (
    <div className="admin-subcard">
      <div className="admin-subcard__header">
        <h4>{title}</h4>
        <button className="ghost-button" type="button" onClick={() => onChange([...options, createOption()])}>
          Seçenek ekle
        </button>
      </div>

      <div className="admin-stack">
        {options.map((option, index) => (
          <div className="admin-item-card" key={option.id}>
            <div className="admin-grid-two">
              <label className="question-card question-card--compact">
                <span className="question-card__label">Değer</span>
                <input
                  className="input-control"
                  type="text"
                  value={option.value}
                  onChange={(event) =>
                    onChange(
                      options.map((item) =>
                        item.id === option.id ? { ...item, value: event.target.value } : item,
                      ),
                    )
                  }
                />
              </label>
              <label className="question-card question-card--compact">
                <span className="question-card__label">Etiket</span>
                <input
                  className="input-control"
                  type="text"
                  value={option.label}
                  onChange={(event) =>
                    onChange(
                      options.map((item) =>
                        item.id === option.id ? { ...item, label: event.target.value } : item,
                      ),
                    )
                  }
                />
              </label>
              <label className="question-card question-card--compact">
                <span className="question-card__label">Açıklama / hint</span>
                <input
                  className="input-control"
                  type="text"
                  value={option.hint ?? ""}
                  onChange={(event) =>
                    onChange(
                      options.map((item) =>
                        item.id === option.id ? { ...item, hint: event.target.value || undefined } : item,
                      ),
                    )
                  }
                />
              </label>
            </div>

            <div className="admin-inline">
              <button
                className="ghost-button"
                disabled={index === 0}
                type="button"
                onClick={() => {
                  const next = [...options];
                  [next[index - 1], next[index]] = [next[index], next[index - 1]];
                  onChange(next);
                }}
              >
                Yukarı
              </button>
              <button
                className="ghost-button"
                disabled={index === options.length - 1}
                type="button"
                onClick={() => {
                  const next = [...options];
                  [next[index + 1], next[index]] = [next[index], next[index + 1]];
                  onChange(next);
                }}
              >
                Aşağı
              </button>
              <button
                className="danger-button"
                type="button"
                onClick={() => onChange(options.filter((item) => item.id !== option.id))}
              >
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminFormBuilder({
  initialDraft,
  initialPublished,
  versions,
}: AdminFormBuilderProps) {
  const [schema, setSchema] = useState<SurveySchema>(cloneSurveySchema(initialDraft.schema));
  const [draftVersion, setDraftVersion] = useState<SurveyVersion>(initialDraft);
  const [publishedVersion, setPublishedVersion] = useState<SurveyVersion>(initialPublished);
  const [allVersions, setAllVersions] = useState<SurveyVersionMeta[]>(versions);
  const [selectedSectionId, setSelectedSectionId] = useState(schema.sections[0]?.id ?? null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedSection = useMemo(
    () => schema.sections.find((section) => section.id === selectedSectionId) ?? schema.sections[0] ?? null,
    [schema.sections, selectedSectionId],
  );

  const schemaIssues = validateSurveySchema(schema);

  const updateSchema = (updater: (draft: SurveySchema) => void) => {
    setSchema((current) => {
      const next = clone(current);
      updater(next);
      return next;
    });
  };

  const updateSelectedSection = (updater: (section: SurveySectionDefinition) => void) => {
    if (!selectedSection) return;

    updateSchema((draft) => {
      const section = draft.sections.find((item) => item.id === selectedSection.id);
      if (section) {
        updater(section);
      }
    });
  };

  const updateField = (fieldId: string, updater: (field: SurveyFieldDefinition) => SurveyFieldDefinition) => {
    if (!selectedSection) return;

    updateSchema((draft) => {
      const section = draft.sections.find((item) => item.id === selectedSection.id);
      if (!section?.fields) return;
      section.fields = section.fields.map((field) => (field.id === fieldId ? updater(field) : field));
    });
  };

  const saveDraft = async () => {
    setSaveState("saving");
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/schema", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schema }),
      });
      const data = (await response.json()) as {
        error?: string;
        draft?: SurveyVersion;
      };

      if (!response.ok || !data.draft) {
        throw new Error(data.error ?? "Taslak kaydedilemedi.");
      }

      setDraftVersion(data.draft);
      setMessage(`Taslak v${data.draft.versionNumber} olarak kaydedildi.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Taslak kaydedilemedi.");
    } finally {
      setSaveState("idle");
    }
  };

  const publishDraft = async () => {
    if (schemaIssues.length > 0) {
      setError("Yayınlamadan önce şema hatalarını giderin.");
      return;
    }

    setSaveState("publishing");
    setError(null);
    setMessage(null);

    try {
      const saveResponse = await fetch("/api/admin/schema", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schema }),
      });
      const saveData = (await saveResponse.json()) as { error?: string; draft?: SurveyVersion };
      if (!saveResponse.ok || !saveData.draft) {
        throw new Error(saveData.error ?? "Yayın öncesi taslak kaydedilemedi.");
      }

      const publishResponse = await fetch("/api/admin/schema/publish", { method: "POST" });
      const publishData = (await publishResponse.json()) as {
        error?: string;
        published?: SurveyVersion;
      };
      if (!publishResponse.ok || !publishData.published) {
        throw new Error(publishData.error ?? "Taslak yayınlanamadı.");
      }

      const published = publishData.published;
      setPublishedVersion(published);
      setDraftVersion(published);
      setAllVersions((current) => {
        const next = current.filter((item) => item.id !== published.id);
        return [
          { id: published.id, versionNumber: published.versionNumber, status: "published" },
          ...next.map((item) =>
            item.status === "published" ? { ...item, status: "archived" as const } : item,
          ),
        ];
      });
      setMessage(`v${published.versionNumber} başarıyla yayınlandı.`);
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : "Taslak yayınlanamadı.");
    } finally {
      setSaveState("idle");
    }
  };

  return (
    <section className="admin-builder">
      <div className="admin-builder__main">
        <div className="admin-panel admin-panel--tight">
          <div className="admin-builder__header">
            <div>
              <h3>Şema kontrol merkezi</h3>
              <p>
                Draft v{draftVersion.versionNumber} · Published v{publishedVersion.versionNumber}
              </p>
            </div>
            <div className="admin-inline">
              <button
                className="ghost-button"
                disabled={saveState !== "idle"}
                type="button"
                onClick={saveDraft}
              >
                {saveState === "saving" ? "Kaydediliyor..." : "Save Draft"}
              </button>
              <button
                className="primary-button"
                disabled={saveState !== "idle"}
                type="button"
                onClick={publishDraft}
              >
                {saveState === "publishing" ? "Yayınlanıyor..." : "Publish"}
              </button>
            </div>
          </div>

          <div className="admin-grid-two">
            <label className="question-card">
              <span className="question-card__label">Form başlığı</span>
              <input
                className="input-control"
                type="text"
                value={schema.title}
                onChange={(event) =>
                  setSchema((current) => ({ ...current, title: event.target.value }))
                }
              />
            </label>
            <label className="question-card">
              <span className="question-card__label">Tahmini süre</span>
              <input
                className="input-control"
                type="text"
                value={schema.estimatedMinutes}
                onChange={(event) =>
                  setSchema((current) => ({ ...current, estimatedMinutes: event.target.value }))
                }
              />
            </label>
          </div>

          <label className="question-card">
            <span className="question-card__label">Form açıklaması</span>
            <textarea
              className="textarea-control"
              rows={4}
              value={schema.description}
              onChange={(event) =>
                setSchema((current) => ({ ...current, description: event.target.value }))
              }
            />
          </label>

          {message ? <p className="admin-form__success">{message}</p> : null}
          {error ? <p className="admin-form__error">{error}</p> : null}
          {schemaIssues.length > 0 ? (
            <div className="admin-issues">
              <h4>Şema uyarıları</h4>
              <ul>
                {schemaIssues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="admin-panel">
          <div className="admin-subcard__header">
            <h3>Bölümler</h3>
            <button
              className="ghost-button"
              type="button"
              onClick={() => {
                const section = createSection();
                updateSchema((draft) => {
                  draft.sections.push(section);
                });
                setSelectedSectionId(section.id);
              }}
            >
              Bölüm ekle
            </button>
          </div>

          <div className="admin-section-list">
            {schema.sections.map((section, index) => (
              <button
                key={section.id}
                className={`admin-section-list__item${selectedSection?.id === section.id ? " admin-section-list__item--active" : ""}`}
                type="button"
                onClick={() => setSelectedSectionId(section.id)}
              >
                <span>
                  {index + 1}. {section.title}
                </span>
                <small>{section.type}</small>
              </button>
            ))}
          </div>

          {selectedSection ? (
            <div className="admin-stack">
              <div className="admin-inline">
                <button
                  className="ghost-button"
                  disabled={schema.sections[0]?.id === selectedSection.id}
                  type="button"
                  onClick={() =>
                    updateSchema((draft) => {
                      const index = draft.sections.findIndex((section) => section.id === selectedSection.id);
                      if (index <= 0) return;
                      [draft.sections[index - 1], draft.sections[index]] = [
                        draft.sections[index],
                        draft.sections[index - 1],
                      ];
                    })
                  }
                >
                  Bölümü yukarı al
                </button>
                <button
                  className="ghost-button"
                  disabled={schema.sections[schema.sections.length - 1]?.id === selectedSection.id}
                  type="button"
                  onClick={() =>
                    updateSchema((draft) => {
                      const index = draft.sections.findIndex((section) => section.id === selectedSection.id);
                      if (index < 0 || index >= draft.sections.length - 1) return;
                      [draft.sections[index + 1], draft.sections[index]] = [
                        draft.sections[index],
                        draft.sections[index + 1],
                      ];
                    })
                  }
                >
                  Bölümü aşağı al
                </button>
                <button
                  className="danger-button"
                  type="button"
                  onClick={() =>
                    updateSchema((draft) => {
                      draft.sections = draft.sections.filter((section) => section.id !== selectedSection.id);
                      setSelectedSectionId(draft.sections[0]?.id ?? null);
                    })
                  }
                >
                  Bölümü sil
                </button>
              </div>

              <div className="admin-grid-two">
                <label className="question-card question-card--compact">
                  <span className="question-card__label">Section key</span>
                  <input
                    className="input-control"
                    type="text"
                    value={selectedSection.key}
                    onChange={(event) =>
                      updateSelectedSection((section) => {
                        section.key = event.target.value;
                      })
                    }
                  />
                </label>
                <label className="question-card question-card--compact">
                  <span className="question-card__label">Eyebrow</span>
                  <input
                    className="input-control"
                    type="text"
                    value={selectedSection.eyebrow}
                    onChange={(event) =>
                      updateSelectedSection((section) => {
                        section.eyebrow = event.target.value;
                      })
                    }
                  />
                </label>
              </div>

              <label className="question-card question-card--compact">
                <span className="question-card__label">Başlık</span>
                <input
                  className="input-control"
                  type="text"
                  value={selectedSection.title}
                  onChange={(event) =>
                    updateSelectedSection((section) => {
                      section.title = event.target.value;
                    })
                  }
                />
              </label>

              <label className="question-card question-card--compact">
                <span className="question-card__label">Açıklama</span>
                <textarea
                  className="textarea-control"
                  rows={3}
                  value={selectedSection.description}
                  onChange={(event) =>
                    updateSelectedSection((section) => {
                      section.description = event.target.value;
                    })
                  }
                />
              </label>

              {selectedSection.type === "basic" ? (
                <>
                  <div className="admin-subcard__header">
                    <h4>Alanlar</h4>
                    <div className="admin-inline">
                      {(["text", "number", "textarea", "time", "radio", "checkbox", "matrix"] as const).map(
                        (type) => (
                          <button
                            key={type}
                            className="ghost-button"
                            type="button"
                            onClick={() =>
                              updateSelectedSection((section) => {
                                section.fields = [...(section.fields ?? []), createField(type)];
                              })
                            }
                          >
                            + {type}
                          </button>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="admin-stack">
                    {(selectedSection.fields ?? []).map((field, index) => (
                      <div className="admin-item-card" key={field.id}>
                        <div className="admin-subcard__header">
                          <h4>
                            {index + 1}. {field.label}
                          </h4>
                          <div className="admin-inline">
                            <button
                              className="ghost-button"
                              disabled={index === 0}
                              type="button"
                              onClick={() =>
                                updateSelectedSection((section) => {
                                  if (!section.fields) return;
                                  [section.fields[index - 1], section.fields[index]] = [
                                    section.fields[index],
                                    section.fields[index - 1],
                                  ];
                                })
                              }
                            >
                              Yukarı
                            </button>
                            <button
                              className="ghost-button"
                              disabled={index === (selectedSection.fields?.length ?? 0) - 1}
                              type="button"
                              onClick={() =>
                                updateSelectedSection((section) => {
                                  if (!section.fields) return;
                                  [section.fields[index + 1], section.fields[index]] = [
                                    section.fields[index],
                                    section.fields[index + 1],
                                  ];
                                })
                              }
                            >
                              Aşağı
                            </button>
                            <button
                              className="danger-button"
                              type="button"
                              onClick={() =>
                                updateSelectedSection((section) => {
                                  section.fields = (section.fields ?? []).filter((item) => item.id !== field.id);
                                })
                              }
                            >
                              Sil
                            </button>
                          </div>
                        </div>

                        <div className="admin-grid-two">
                          <label className="question-card question-card--compact">
                            <span className="question-card__label">Alan key</span>
                            <input
                              className="input-control"
                              type="text"
                              value={field.key}
                              onChange={(event) =>
                                updateField(field.id, (current) => ({
                                  ...current,
                                  key: event.target.value,
                                }))
                              }
                            />
                          </label>
                          <label className="question-card question-card--compact">
                            <span className="question-card__label">Tip</span>
                            <select
                              className="select-control"
                              value={field.type}
                              onChange={(event) =>
                                updateField(field.id, (current) =>
                                  transformFieldType(
                                    current,
                                    event.target.value as SurveyFieldDefinition["type"],
                                  ),
                                )
                              }
                            >
                              <option value="text">text</option>
                              <option value="number">number</option>
                              <option value="textarea">textarea</option>
                              <option value="time">time</option>
                              <option value="radio">radio</option>
                              <option value="checkbox">checkbox</option>
                              <option value="matrix">matrix</option>
                            </select>
                          </label>
                          <label className="question-card question-card--compact">
                            <span className="question-card__label">Etiket</span>
                            <input
                              className="input-control"
                              type="text"
                              value={field.label}
                              onChange={(event) =>
                                updateField(field.id, (current) => ({
                                  ...current,
                                  label: event.target.value,
                                }))
                              }
                            />
                          </label>
                          <label className="question-card question-card--compact">
                            <span className="question-card__label">Analytics role</span>
                            <input
                              className="input-control"
                              type="text"
                              value={field.analyticsRole ?? ""}
                              onChange={(event) =>
                                updateField(field.id, (current) => ({
                                  ...current,
                                  analyticsRole: (event.target.value || undefined) as AnalyticsRole | undefined,
                                }))
                              }
                            />
                          </label>
                        </div>

                        <label className="question-card question-card--compact">
                          <span className="question-card__label">Açıklama</span>
                          <textarea
                            className="textarea-control"
                            rows={2}
                            value={field.description ?? ""}
                            onChange={(event) =>
                              updateField(field.id, (current) => ({
                                ...current,
                                description: event.target.value || undefined,
                              }))
                            }
                          />
                        </label>

                        <div className="admin-inline admin-inline--spaced">
                          <label className="admin-switch">
                            <input
                              checked={Boolean(field.required)}
                              type="checkbox"
                              onChange={(event) =>
                                updateField(field.id, (current) => ({
                                  ...current,
                                  required: event.target.checked,
                                }))
                              }
                            />
                            <span>Zorunlu</span>
                          </label>
                        </div>

                        {field.type === "text" || field.type === "number" || field.type === "textarea" || field.type === "time" ? (
                          <div className="admin-grid-two">
                            <label className="question-card question-card--compact">
                              <span className="question-card__label">Placeholder</span>
                              <input
                                className="input-control"
                                type="text"
                                value={field.placeholder ?? ""}
                                onChange={(event) =>
                                  updateField(field.id, (current) =>
                                    current.type === "text" ||
                                    current.type === "number" ||
                                    current.type === "textarea" ||
                                    current.type === "time"
                                      ? {
                                          ...current,
                                          placeholder: event.target.value || undefined,
                                        }
                                      : current,
                                  )
                                }
                              />
                            </label>
                            {field.type === "number" ? (
                              <>
                                <label className="question-card question-card--compact">
                                  <span className="question-card__label">Min</span>
                                  <input
                                    className="input-control"
                                    type="number"
                                    value={field.min ?? ""}
                                    onChange={(event) =>
                                      updateField(field.id, (current) =>
                                        current.type === "number"
                                          ? {
                                              ...current,
                                              min: event.target.value
                                                ? Number(event.target.value)
                                                : undefined,
                                            }
                                          : current,
                                      )
                                    }
                                  />
                                </label>
                                <label className="question-card question-card--compact">
                                  <span className="question-card__label">Max</span>
                                  <input
                                    className="input-control"
                                    type="number"
                                    value={field.max ?? ""}
                                    onChange={(event) =>
                                      updateField(field.id, (current) =>
                                        current.type === "number"
                                          ? {
                                              ...current,
                                              max: event.target.value
                                                ? Number(event.target.value)
                                                : undefined,
                                            }
                                          : current,
                                      )
                                    }
                                  />
                                </label>
                                <label className="question-card question-card--compact">
                                  <span className="question-card__label">Step</span>
                                  <input
                                    className="input-control"
                                    type="number"
                                    value={field.step ?? ""}
                                    onChange={(event) =>
                                      updateField(field.id, (current) =>
                                        current.type === "number"
                                          ? {
                                              ...current,
                                              step: event.target.value
                                                ? Number(event.target.value)
                                                : undefined,
                                            }
                                          : current,
                                      )
                                    }
                                  />
                                </label>
                              </>
                            ) : null}
                          </div>
                        ) : null}

                        {field.type === "radio" || field.type === "checkbox" ? (
                          <>
                            <div className="admin-grid-two">
                              <label className="question-card question-card--compact">
                                <span className="question-card__label">Kolon sayısı</span>
                                <select
                                  className="select-control"
                                  value={field.columns ?? 2}
                                  onChange={(event) =>
                                    updateField(field.id, (current) =>
                                      current.type === "radio" || current.type === "checkbox"
                                        ? {
                                            ...current,
                                            columns: Number(event.target.value) as 2 | 3 | 4,
                                          }
                                        : current,
                                    )
                                  }
                                >
                                  <option value={2}>2</option>
                                  <option value={3}>3</option>
                                  <option value={4}>4</option>
                                </select>
                              </label>
                              {field.type === "checkbox" ? (
                                <label className="question-card question-card--compact">
                                  <span className="question-card__label">Max seçim</span>
                                  <input
                                    className="input-control"
                                    type="number"
                                    value={field.maxSelections ?? ""}
                                    onChange={(event) =>
                                      updateField(field.id, (current) =>
                                        current.type === "checkbox"
                                          ? {
                                              ...current,
                                              maxSelections: event.target.value
                                                ? Number(event.target.value)
                                                : undefined,
                                            }
                                          : current,
                                      )
                                    }
                                  />
                                </label>
                              ) : null}
                            </div>

                            <OptionListEditor
                              options={field.options}
                              title="Seçenekler"
                              onChange={(options) =>
                                updateField(field.id, (current) =>
                                  current.type === "radio" || current.type === "checkbox"
                                    ? { ...current, options }
                                    : current,
                                )
                              }
                            />
                          </>
                        ) : null}

                        {field.type === "matrix" ? (
                          <>
                            <div className="admin-subcard">
                              <div className="admin-subcard__header">
                                <h4>Satırlar</h4>
                                <button
                                  className="ghost-button"
                                  type="button"
                                  onClick={() =>
                                    updateField(field.id, (current) =>
                                      current.type === "matrix"
                                        ? {
                                            ...current,
                                            rows: [
                                              ...current.rows,
                                              {
                                                id: createEditorId("row"),
                                                key: `row_${current.rows.length + 1}`,
                                                label: `Satır ${current.rows.length + 1}`,
                                              },
                                            ],
                                          }
                                        : current,
                                    )
                                  }
                                >
                                  Satır ekle
                                </button>
                              </div>
                              <div className="admin-stack">
                                {field.rows.map((row) => (
                                  <div className="admin-item-card" key={row.id}>
                                    <div className="admin-grid-two">
                                      <label className="question-card question-card--compact">
                                        <span className="question-card__label">Satır key</span>
                                        <input
                                          className="input-control"
                                          type="text"
                                          value={row.key}
                                          onChange={(event) =>
                                            updateField(field.id, (current) =>
                                              current.type === "matrix"
                                                ? {
                                                    ...current,
                                                    rows: current.rows.map((item) =>
                                                      item.id === row.id
                                                        ? { ...item, key: event.target.value }
                                                        : item,
                                                    ),
                                                  }
                                                : current,
                                            )
                                          }
                                        />
                                      </label>
                                      <label className="question-card question-card--compact">
                                        <span className="question-card__label">Satır etiket</span>
                                        <input
                                          className="input-control"
                                          type="text"
                                          value={row.label}
                                          onChange={(event) =>
                                            updateField(field.id, (current) =>
                                              current.type === "matrix"
                                                ? {
                                                    ...current,
                                                    rows: current.rows.map((item) =>
                                                      item.id === row.id
                                                        ? { ...item, label: event.target.value }
                                                        : item,
                                                    ),
                                                  }
                                                : current,
                                            )
                                          }
                                        />
                                      </label>
                                      <label className="question-card question-card--compact">
                                        <span className="question-card__label">Analytics role</span>
                                        <input
                                          className="input-control"
                                          type="text"
                                          value={row.analyticsRole ?? ""}
                                          onChange={(event) =>
                                            updateField(field.id, (current) =>
                                              current.type === "matrix"
                                                ? {
                                                    ...current,
                                                    rows: current.rows.map((item) =>
                                                      item.id === row.id
                                                        ? {
                                                            ...item,
                                                            analyticsRole: (
                                                              event.target.value || undefined
                                                            ) as AnalyticsRole | undefined,
                                                          }
                                                        : item,
                                                    ),
                                                  }
                                                : current,
                                            )
                                          }
                                        />
                                      </label>
                                    </div>
                                    <button
                                      className="danger-button"
                                      type="button"
                                      onClick={() =>
                                        updateField(field.id, (current) =>
                                          current.type === "matrix"
                                            ? {
                                                ...current,
                                                rows: current.rows.filter((item) => item.id !== row.id),
                                              }
                                            : current,
                                        )
                                      }
                                    >
                                      Satırı sil
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <OptionListEditor
                              options={field.columns}
                              title="Sütunlar"
                              onChange={(columns) =>
                                updateField(field.id, (current) =>
                                  current.type === "matrix" ? { ...current, columns } : current,
                                )
                              }
                            />
                          </>
                        ) : null}

                        <ConditionEditor
                          label="Required when"
                          value={field.requiredWhen}
                          onChange={(value) =>
                            updateField(field.id, (current) => ({
                              ...current,
                              requiredWhen: value,
                            }))
                          }
                        />

                        <ConditionEditor
                          label="Visibility"
                          value={field.visibility}
                          onChange={(value) =>
                            updateField(field.id, (current) => ({
                              ...current,
                              visibility: value,
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="admin-muted">
                  Bu bölüm özel tipte (`{selectedSection.type}`); soru listesi yerine aşağıdaki global
                  FFQ / UPF editörlerini kullanın.
                </p>
              )}
            </div>
          ) : null}
        </div>

        <div className="admin-panel">
          <div className="admin-subcard__header">
            <h3>FFQ kategorileri</h3>
            <button
              className="ghost-button"
              type="button"
              onClick={() =>
                updateSchema((draft) => {
                  draft.ffqCategories.push(createFfqCategory());
                })
              }
            >
              FFQ kategori ekle
            </button>
          </div>
          <div className="admin-stack">
            {schema.ffqCategories.map((category) => (
              <div className="admin-item-card" key={category.id}>
                <div className="admin-grid-two">
                  <label className="question-card question-card--compact">
                    <span className="question-card__label">Kategori key</span>
                    <input
                      className="input-control"
                      type="text"
                      value={category.key}
                      onChange={(event) =>
                        updateSchema((draft) => {
                          draft.ffqCategories = draft.ffqCategories.map((item) =>
                            item.id === category.id ? { ...item, key: event.target.value } : item,
                          );
                        })
                      }
                    />
                  </label>
                  <label className="question-card question-card--compact">
                    <span className="question-card__label">Başlık</span>
                    <input
                      className="input-control"
                      type="text"
                      value={category.title}
                      onChange={(event) =>
                        updateSchema((draft) => {
                          draft.ffqCategories = draft.ffqCategories.map((item) =>
                            item.id === category.id ? { ...item, title: event.target.value } : item,
                          );
                        })
                      }
                    />
                  </label>
                </div>

                <div className="admin-subcard__header">
                  <h4>Besinler</h4>
                  <div className="admin-inline">
                    <button
                      className="ghost-button"
                      type="button"
                      onClick={() =>
                        updateSchema((draft) => {
                          draft.ffqCategories = draft.ffqCategories.map((item) =>
                            item.id === category.id
                              ? { ...item, items: [...item.items, createFfqItem()] }
                              : item,
                          );
                        })
                      }
                    >
                      Besin ekle
                    </button>
                    <button
                      className="danger-button"
                      type="button"
                      onClick={() =>
                        updateSchema((draft) => {
                          draft.ffqCategories = draft.ffqCategories.filter((item) => item.id !== category.id);
                        })
                      }
                    >
                      Kategoriyi sil
                    </button>
                  </div>
                </div>

                <div className="admin-stack">
                  {category.items.map((item) => (
                    <div className="admin-item-card" key={item.id}>
                      <div className="admin-grid-two">
                        <label className="question-card question-card--compact">
                          <span className="question-card__label">Besin key</span>
                          <input
                            className="input-control"
                            type="text"
                            value={item.key}
                            onChange={(event) =>
                              updateSchema((draft) => {
                                draft.ffqCategories = draft.ffqCategories.map((categoryItem) =>
                                  categoryItem.id === category.id
                                    ? {
                                        ...categoryItem,
                                        items: categoryItem.items.map((entry) =>
                                          entry.id === item.id ? { ...entry, key: event.target.value } : entry,
                                        ),
                                      }
                                    : categoryItem,
                                );
                              })
                            }
                          />
                        </label>
                        <label className="question-card question-card--compact">
                          <span className="question-card__label">Etiket</span>
                          <input
                            className="input-control"
                            type="text"
                            value={item.label}
                            onChange={(event) =>
                              updateSchema((draft) => {
                                draft.ffqCategories = draft.ffqCategories.map((categoryItem) =>
                                  categoryItem.id === category.id
                                    ? {
                                        ...categoryItem,
                                        items: categoryItem.items.map((entry) =>
                                          entry.id === item.id ? { ...entry, label: event.target.value } : entry,
                                        ),
                                      }
                                    : categoryItem,
                                );
                              })
                            }
                          />
                        </label>
                        <label className="question-card question-card--compact">
                          <span className="question-card__label">Helper</span>
                          <input
                            className="input-control"
                            type="text"
                            value={item.helper ?? ""}
                            onChange={(event) =>
                              updateSchema((draft) => {
                                draft.ffqCategories = draft.ffqCategories.map((categoryItem) =>
                                  categoryItem.id === category.id
                                    ? {
                                        ...categoryItem,
                                        items: categoryItem.items.map((entry) =>
                                          entry.id === item.id
                                            ? { ...entry, helper: event.target.value || undefined }
                                            : entry,
                                        ),
                                      }
                                    : categoryItem,
                                );
                              })
                            }
                          />
                        </label>
                        <label className="question-card question-card--compact">
                          <span className="question-card__label">Portion hint</span>
                          <input
                            className="input-control"
                            type="text"
                            value={item.portionHint}
                            onChange={(event) =>
                              updateSchema((draft) => {
                                draft.ffqCategories = draft.ffqCategories.map((categoryItem) =>
                                  categoryItem.id === category.id
                                    ? {
                                        ...categoryItem,
                                        items: categoryItem.items.map((entry) =>
                                          entry.id === item.id
                                            ? { ...entry, portionHint: event.target.value }
                                            : entry,
                                        ),
                                      }
                                    : categoryItem,
                                );
                              })
                            }
                          />
                        </label>
                      </div>
                      <button
                        className="danger-button"
                        type="button"
                        onClick={() =>
                          updateSchema((draft) => {
                            draft.ffqCategories = draft.ffqCategories.map((categoryItem) =>
                              categoryItem.id === category.id
                                ? {
                                    ...categoryItem,
                                    items: categoryItem.items.filter((entry) => entry.id !== item.id),
                                  }
                                : categoryItem,
                            );
                          })
                        }
                      >
                        Besini sil
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-subcard__header">
            <h3>UPF kayıtları</h3>
            <button
              className="ghost-button"
              type="button"
              onClick={() =>
                updateSchema((draft) => {
                  draft.upfItems.push(createUpfItem());
                })
              }
            >
              UPF kaydı ekle
            </button>
          </div>
          <div className="admin-stack">
            {schema.upfItems.map((item) => (
              <div className="admin-item-card" key={item.id}>
                <div className="admin-grid-two">
                  <label className="question-card question-card--compact">
                    <span className="question-card__label">UPF key</span>
                    <input
                      className="input-control"
                      type="text"
                      value={item.key}
                      onChange={(event) =>
                        updateSchema((draft) => {
                          draft.upfItems = draft.upfItems.map((entry) =>
                            entry.id === item.id ? { ...entry, key: event.target.value } : entry,
                          );
                        })
                      }
                    />
                  </label>
                  <label className="question-card question-card--compact">
                    <span className="question-card__label">Grup</span>
                    <input
                      className="input-control"
                      type="text"
                      value={item.group}
                      onChange={(event) =>
                        updateSchema((draft) => {
                          draft.upfItems = draft.upfItems.map((entry) =>
                            entry.id === item.id ? { ...entry, group: event.target.value } : entry,
                          );
                        })
                      }
                    />
                  </label>
                  <label className="question-card question-card--compact">
                    <span className="question-card__label">Foods</span>
                    <textarea
                      className="textarea-control"
                      rows={2}
                      value={item.foods}
                      onChange={(event) =>
                        updateSchema((draft) => {
                          draft.upfItems = draft.upfItems.map((entry) =>
                            entry.id === item.id ? { ...entry, foods: event.target.value } : entry,
                          );
                        })
                      }
                    />
                  </label>
                  <label className="question-card question-card--compact">
                    <span className="question-card__label">Threshold</span>
                    <input
                      className="input-control"
                      type="text"
                      value={item.threshold}
                      onChange={(event) =>
                        updateSchema((draft) => {
                          draft.upfItems = draft.upfItems.map((entry) =>
                            entry.id === item.id ? { ...entry, threshold: event.target.value } : entry,
                          );
                        })
                      }
                    />
                  </label>
                </div>

                <button
                  className="danger-button"
                  type="button"
                  onClick={() =>
                    updateSchema((draft) => {
                      draft.upfItems = draft.upfItems.filter((entry) => entry.id !== item.id);
                    })
                  }
                >
                  UPF kaydını sil
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-panel admin-panel--tight">
          <div className="admin-subcard__header">
            <h3>Versiyon geçmişi</h3>
          </div>
          <div className="admin-version-list">
            {allVersions.map((version) => (
              <div className="admin-version-pill" key={version.id}>
                <strong>v{version.versionNumber}</strong>
                <span>{version.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <aside className="admin-builder__preview">
        <div className="admin-panel admin-panel--sticky">
          <div className="admin-subcard__header">
            <h3>Canlı preview</h3>
            <span>{schema.sections.length} bölüm</span>
          </div>
          <SurveyForm key={draftVersion.id} mode="preview" schema={schema} versionId={draftVersion.id} />
        </div>
      </aside>
    </section>
  );
}
