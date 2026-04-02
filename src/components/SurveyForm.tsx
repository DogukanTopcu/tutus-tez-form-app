"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import {
  ffqKey,
  fieldIsRequired,
  fieldIsVisible,
  getArrayValue,
  getDraftStorageKey,
  getSectionValidationMessage,
  getTextValue,
  isValuePresent,
  matrixKey,
  sectionIsComplete,
  upfKey,
  type CheckboxFieldDefinition,
  type SurveyFieldDefinition,
  type SurveyResponses,
  type SurveySchema,
  type SurveySectionDefinition,
} from "@/lib/survey-schema";

type SubmissionState =
  | { type: "idle" }
  | { type: "success"; referenceId: string };

type Toast = { id: number; message: string; kind: "warning" | "error" | "info" };

type SurveyFormProps = {
  schema: SurveySchema;
  versionId: string;
  mode?: "public" | "preview";
};

const formatSavedAt = (timestamp: number | null) => {
  if (!timestamp) return "Henüz yerel taslak oluşmadı";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
};

const scrollToTop = () => {
  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

const resolveRadioLabel = (
  options: { value: string; label: string }[],
  value: string,
): string => options.find((option) => option.value === value)?.label ?? value;

const resolveCheckboxLabels = (
  options: { value: string; label: string }[],
  values: string[],
): string =>
  values.map((value) => options.find((option) => option.value === value)?.label ?? value).join(", ");

type RenderFieldProps = {
  field: SurveyFieldDefinition;
  responses: SurveyResponses;
  onValueChange: (key: string, value: string) => void;
  onCheckboxToggle: (field: CheckboxFieldDefinition, optionValue: string) => void;
};

function RenderField({ field, responses, onValueChange, onCheckboxToggle }: RenderFieldProps) {
  if (!fieldIsVisible(field, responses)) {
    return null;
  }

  const required = fieldIsRequired(field, responses);

  if (field.type === "text" || field.type === "number" || field.type === "time") {
    return (
      <label className="question-card">
        <span className="question-card__label">
          {field.label}
          {required ? <span className="required-mark">*</span> : null}
        </span>
        {field.description ? (
          <span className="question-card__description">{field.description}</span>
        ) : null}
        <input
          className="input-control"
          max={field.max}
          min={field.min}
          placeholder={field.placeholder}
          step={field.step}
          type={field.type}
          value={getTextValue(responses, field.key)}
          onChange={(event) => onValueChange(field.key, event.target.value)}
        />
      </label>
    );
  }

  if (field.type === "textarea") {
    return (
      <label className="question-card">
        <span className="question-card__label">
          {field.label}
          {required ? <span className="required-mark">*</span> : null}
        </span>
        {field.description ? (
          <span className="question-card__description">{field.description}</span>
        ) : null}
        <textarea
          className="textarea-control"
          placeholder={field.placeholder}
          rows={4}
          value={getTextValue(responses, field.key)}
          onChange={(event) => onValueChange(field.key, event.target.value)}
        />
      </label>
    );
  }

  if (field.type === "radio") {
    return (
      <fieldset className="question-card">
        <legend className="question-card__label">
          {field.label}
          {required ? <span className="required-mark">*</span> : null}
        </legend>
        {field.description ? (
          <p className="question-card__description">{field.description}</p>
        ) : null}
        <div className={`option-grid option-grid--${field.columns ?? 2}`}>
          {field.options.map((option) => (
            <label className="option-card" key={option.id}>
              <input
                checked={getTextValue(responses, field.key) === option.value}
                name={field.key}
                type="radio"
                value={option.value}
                onChange={(event) => onValueChange(field.key, event.target.value)}
              />
              <span className="option-card__content">
                <span className="option-card__label">{option.label}</span>
                {option.hint ? <span className="option-card__hint">{option.hint}</span> : null}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  if (field.type === "checkbox") {
    const selected = getArrayValue(responses, field.key);
    const maxReached = Boolean(field.maxSelections && selected.length >= field.maxSelections);

    return (
      <fieldset className="question-card">
        <legend className="question-card__label">
          {field.label}
          {required ? <span className="required-mark">*</span> : null}
        </legend>
        {field.description ? (
          <p className="question-card__description">{field.description}</p>
        ) : null}
        {field.maxSelections ? (
          <p className="question-card__meta">
            {selected.length}/{field.maxSelections} seçim kullanıldı
          </p>
        ) : null}
        <div className={`option-grid option-grid--${field.columns ?? 2}`}>
          {field.options.map((option) => {
            const isChecked = selected.includes(option.value);
            const shouldDisable = Boolean(maxReached && !isChecked);
            return (
              <label
                className={`option-card${shouldDisable ? " option-card--disabled" : ""}`}
                key={option.id}
              >
                <input
                  checked={isChecked}
                  disabled={shouldDisable}
                  type="checkbox"
                  value={option.value}
                  onChange={() => onCheckboxToggle(field, option.value)}
                />
                <span className="option-card__content">
                  <span className="option-card__label">{option.label}</span>
                  {option.hint ? <span className="option-card__hint">{option.hint}</span> : null}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
    );
  }

  if (field.type === "matrix") {
    return (
      <fieldset className="question-card">
        <legend className="question-card__label">
          {field.label}
          {required ? <span className="required-mark">*</span> : null}
        </legend>
        {field.description ? (
          <p className="question-card__description">{field.description}</p>
        ) : null}
        <div className="matrix-grid">
          <div className="matrix-grid__header">
            <span className="matrix-grid__header-spacer">Durum</span>
            {field.columns.map((column) => (
              <span className="matrix-grid__header-cell" key={column.id}>
                {column.label}
              </span>
            ))}
          </div>
          {field.rows.map((row) => (
            <div className="matrix-grid__row" key={row.id}>
              <span className="matrix-grid__row-label">{row.label}</span>
              <div className="matrix-grid__choices">
                {field.columns.map((column) => (
                  <label className="matrix-grid__choice" key={column.id}>
                    <input
                      checked={
                        getTextValue(responses, matrixKey(field.key, row.key)) === column.value
                      }
                      name={matrixKey(field.key, row.key)}
                      type="radio"
                      value={column.value}
                      onChange={(event) =>
                        onValueChange(matrixKey(field.key, row.key), event.target.value)
                      }
                    />
                    <span>{column.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </fieldset>
    );
  }

  return null;
}

function FoodFrequencySection({
  schema,
  responses,
  onValueChange,
}: {
  schema: SurveySchema;
  responses: SurveyResponses;
  onValueChange: (key: string, value: string) => void;
}) {
  return (
    <div className="stack">
      <div className="note-card">
        <p className="note-card__title">Nasıl doldurulur?</p>
        <p className="note-card__text">
          Her besin için tüketim sıklığını seçin. Tüketiyorsanız tek seferdeki yaklaşık miktarı
          yazın. Günlük karşılık alanı isteğe bağlıdır ve analiz kolaylığı sağlar.
        </p>
      </div>
      {schema.ffqCategories.map((category) => (
        <section className="ffq-category" key={category.id}>
          <header className="ffq-category__header">
            <h3>{category.title}</h3>
            <span>{category.items.length} besin satırı</span>
          </header>
          <div className="ffq-items">
            {category.items.map((item) => {
              const frequency = getTextValue(responses, ffqKey(item.key, "frequency"));
              return (
                <article className="ffq-item" key={item.id}>
                  <div className="ffq-item__meta">
                    <h4>{item.label}</h4>
                    {item.helper ? <p>{item.helper}</p> : null}
                    <span>Ölçü önerisi: {item.portionHint}</span>
                  </div>
                  <div className="ffq-item__inputs">
                    <label className="question-card question-card--compact">
                      <span className="question-card__label">
                        Tüketim sıklığı<span className="required-mark">*</span>
                      </span>
                      <select
                        className="select-control"
                        value={frequency}
                        onChange={(event) =>
                          onValueChange(ffqKey(item.key, "frequency"), event.target.value)
                        }
                      >
                        <option value="">Seçiniz</option>
                        {[
                          { value: "never", label: "Hiç / yılda 1" },
                          { value: "monthly_1_3", label: "Ayda 1-3 kez" },
                          { value: "weekly_1_2", label: "Haftada 1-2 kez" },
                          { value: "weekly_3_4", label: "Haftada 3-4 kez" },
                          { value: "weekly_5_6", label: "Haftada 5-6 kez" },
                          { value: "daily_1", label: "Günde 1 kez" },
                          { value: "daily_2", label: "Günde 2 kez" },
                          { value: "every_meal", label: "Her öğün +" },
                        ].map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="question-card question-card--compact">
                      <span className="question-card__label">
                        Tek seferde miktar
                        {frequency && frequency !== "never" ? (
                          <span className="required-mark">*</span>
                        ) : null}
                      </span>
                      <input
                        className="input-control"
                        placeholder={item.portionHint}
                        type="text"
                        value={getTextValue(responses, ffqKey(item.key, "portion"))}
                        onChange={(event) =>
                          onValueChange(ffqKey(item.key, "portion"), event.target.value)
                        }
                      />
                    </label>
                    <label className="question-card question-card--compact">
                      <span className="question-card__label">Günlük karşılığı</span>
                      <input
                        className="input-control"
                        placeholder="İsteğe bağlı"
                        type="text"
                        value={getTextValue(responses, ffqKey(item.key, "daily"))}
                        onChange={(event) =>
                          onValueChange(ffqKey(item.key, "daily"), event.target.value)
                        }
                      />
                    </label>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function UltraProcessedSection({
  schema,
  responses,
  onValueChange,
}: {
  schema: SurveySchema;
  responses: SurveyResponses;
  onValueChange: (key: string, value: string) => void;
}) {
  return (
    <div className="stack">
      <div className="note-card">
        <p className="note-card__title">Yanıtlama ölçütü</p>
        <p className="note-card__text">
          Bir besin grubu verilen eşiğe eşit veya daha sık tüketiliyorsa <strong>Evet</strong>,
          daha seyrek tüketiliyorsa <strong>Hayır</strong> seçin.
        </p>
      </div>
      <div className="upf-grid">
        {schema.upfItems.map((item) => (
          <article className="upf-card" key={item.id}>
            <div>
              <p className="upf-card__group">{item.group}</p>
              <p className="upf-card__foods">{item.foods}</p>
              <p className="upf-card__threshold">Eşik: {item.threshold}</p>
            </div>
            <div className="option-grid option-grid--2">
              <label className="option-card">
                <input
                  checked={getTextValue(responses, upfKey(item.key)) === "yes"}
                  name={upfKey(item.key)}
                  type="radio"
                  value="yes"
                  onChange={(event) => onValueChange(upfKey(item.key), event.target.value)}
                />
                <span className="option-card__content">
                  <span className="option-card__label">Evet</span>
                </span>
              </label>
              <label className="option-card">
                <input
                  checked={getTextValue(responses, upfKey(item.key)) === "no"}
                  name={upfKey(item.key)}
                  type="radio"
                  value="no"
                  onChange={(event) => onValueChange(upfKey(item.key), event.target.value)}
                />
                <span className="option-card__content">
                  <span className="option-card__label">Hayır</span>
                </span>
              </label>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="result-row">
      <span className="result-row__label">{label}</span>
      <span className="result-row__value">{value}</span>
    </div>
  );
}

function SectionResults({
  section,
  schema,
  responses,
}: {
  section: SurveySectionDefinition;
  schema: SurveySchema;
  responses: SurveyResponses;
}) {
  if (section.type === "ffq") {
    return (
      <>
        {schema.ffqCategories.map((category) => (
          <div key={category.id} className="results-subsection">
            <p className="results-subsection__title">{category.title}</p>
            <div className="results-ffq-table">
              <div className="results-ffq-table__header">
                <span>Besin</span>
                <span>Sıklık</span>
                <span>Miktar</span>
                <span>Günlük</span>
              </div>
              {category.items.map((item) => (
                <div className="results-ffq-table__row" key={item.id}>
                  <span>{item.label}</span>
                  <span>{getTextValue(responses, ffqKey(item.key, "frequency")) || "—"}</span>
                  <span>{getTextValue(responses, ffqKey(item.key, "portion")) || "—"}</span>
                  <span>{getTextValue(responses, ffqKey(item.key, "daily")) || "—"}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </>
    );
  }

  if (section.type === "upf") {
    return (
      <div className="results-upf-table">
        {schema.upfItems.map((item) => {
          const value = getTextValue(responses, upfKey(item.key));
          return (
            <div className="result-row" key={item.id}>
              <span className="result-row__label">{item.group}</span>
              <span className="result-row__value">
                {value === "yes" ? "Evet" : value === "no" ? "Hayır" : "—"}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <>
      {section.fields?.map((field) => {
        if (field.type === "text" || field.type === "number" || field.type === "time" || field.type === "textarea") {
          const value = getTextValue(responses, field.key);
          if (!value) return null;
          return <ResultRow key={field.id} label={field.label} value={value} />;
        }

        if (field.type === "radio") {
          const value = getTextValue(responses, field.key);
          if (!value) return null;
          return (
            <ResultRow
              key={field.id}
              label={field.label}
              value={resolveRadioLabel(field.options, value)}
            />
          );
        }

        if (field.type === "checkbox") {
          const values = getArrayValue(responses, field.key);
          if (!values.length) return null;
          return (
            <ResultRow
              key={field.id}
              label={field.label}
              value={resolveCheckboxLabels(field.options, values)}
            />
          );
        }

        if (field.type === "matrix") {
          const filledRows = field.rows.filter((row) =>
            isValuePresent(responses[matrixKey(field.key, row.key)]),
          );
          if (!filledRows.length) return null;

          return (
            <div key={field.id} className="result-matrix">
              <p className="result-matrix__label">{field.label}</p>
              {field.rows.map((row) => {
                const value = getTextValue(responses, matrixKey(field.key, row.key));
                if (!value) return null;
                return (
                  <div className="result-matrix__row" key={row.id}>
                    <span>{row.label}</span>
                    <span>{resolveRadioLabel(field.columns, value)}</span>
                  </div>
                );
              })}
            </div>
          );
        }

        return null;
      })}
    </>
  );
}

export function SurveyResults({
  schema,
  responses,
}: {
  schema: SurveySchema;
  responses: SurveyResponses;
}) {
  return (
    <div className="results">
      {schema.sections.map((section) => (
        <section key={section.id} className="results-section">
          <h3 className="results-section__title">
            <span className="results-section__eyebrow">{section.eyebrow}</span>
            {section.title}
          </h3>
          <SectionResults responses={responses} schema={schema} section={section} />
        </section>
      ))}
    </div>
  );
}

export function SurveyForm({
  schema,
  versionId,
  mode = "public",
}: SurveyFormProps) {
  const isPreview = mode === "preview";
  const draftStorageKey = getDraftStorageKey(versionId);
  const hasHydratedDraft = useRef(false);
  const skipNextDraftSave = useRef(false);
  const toastIdRef = useRef(0);
  const [responses, setResponses] = useState<SurveyResponses>({});
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [submissionState, setSubmissionState] = useState<SubmissionState>({ type: "idle" });
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [isNavigating, startNavigation] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const addToast = (message: string, kind: Toast["kind"]) => {
    const id = ++toastIdRef.current;
    setToasts((current) => [...current, { id, message, kind }]);
    setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 5000);
  };

  const dismissToast = (id: number) =>
    setToasts((current) => current.filter((toast) => toast.id !== id));

  useEffect(() => {
    if (isPreview) {
      hasHydratedDraft.current = true;
      return;
    }

    const rawDraft = window.localStorage.getItem(draftStorageKey);
    if (!rawDraft) {
      hasHydratedDraft.current = true;
      return;
    }

    try {
      const parsed = JSON.parse(rawDraft) as {
        responses?: SurveyResponses;
        currentSectionIndex?: number;
        savedAt?: number;
      };

      setResponses(parsed.responses ?? {});
      setCurrentSectionIndex(Math.min(parsed.currentSectionIndex ?? 0, schema.sections.length - 1));
      setSavedAt(parsed.savedAt ?? null);
    } catch {
      window.localStorage.removeItem(draftStorageKey);
    }

    hasHydratedDraft.current = true;
  }, [draftStorageKey, isPreview, schema.sections.length]);

  useEffect(() => {
    if (!hasHydratedDraft.current || isPreview) return;
    if (skipNextDraftSave.current) {
      skipNextDraftSave.current = false;
      return;
    }

    const now = Date.now();
    window.localStorage.setItem(
      draftStorageKey,
      JSON.stringify({ responses, currentSectionIndex, savedAt: now }),
    );
    setSavedAt(now);
  }, [currentSectionIndex, draftStorageKey, isPreview, responses]);

  const currentSection = schema.sections[currentSectionIndex];
  const completedSections = schema.sections.filter((section) =>
    sectionIsComplete(schema, section, responses),
  ).length;
  const progress = Math.round((completedSections / schema.sections.length) * 100);

  const updateValue = (key: string, value: string) => {
    setResponses((current) => ({ ...current, [key]: value }));
  };

  const toggleCheckboxValue = (field: CheckboxFieldDefinition, optionValue: string) => {
    setResponses((current) => {
      const selected = getArrayValue(current, field.key);
      const hasValue = selected.includes(optionValue);
      let nextSelection = hasValue
        ? selected.filter((value) => value !== optionValue)
        : [...selected, optionValue];

      if (optionValue === "none" && !hasValue) {
        nextSelection = ["none"];
      } else if (optionValue !== "none") {
        nextSelection = nextSelection.filter((value) => value !== "none");
      }

      return { ...current, [field.key]: nextSelection };
    });
  };

  const goToSection = (index: number) => {
    if (index > currentSectionIndex) {
      const message = getSectionValidationMessage(schema, currentSection, responses);
      if (message) {
        addToast(message, "warning");
        return;
      }
    }

    startNavigation(() => {
      setCurrentSectionIndex(index);
      scrollToTop();
    });
  };

  const handleNext = () => {
    const message = getSectionValidationMessage(schema, currentSection, responses);
    if (message) {
      addToast(message, "warning");
      return;
    }

    startNavigation(() => {
      setCurrentSectionIndex((index) => Math.min(index + 1, schema.sections.length - 1));
      scrollToTop();
    });
  };

  const handlePrevious = () => {
    startNavigation(() => {
      setCurrentSectionIndex((index) => Math.max(index - 1, 0));
      scrollToTop();
    });
  };

  const clearDraft = () => {
    if (!isPreview) {
      skipNextDraftSave.current = true;
      window.localStorage.removeItem(draftStorageKey);
    }

    setResponses({});
    setCurrentSectionIndex(0);
    setToasts([]);
    setSubmissionState({ type: "idle" });
    setSavedAt(null);
    scrollToTop();
  };

  const submitSurvey = async () => {
    for (let index = 0; index < schema.sections.length; index += 1) {
      const message = getSectionValidationMessage(schema, schema.sections[index], responses);
      if (message) {
        setCurrentSectionIndex(index);
        addToast(message, "warning");
        scrollToTop();
        return;
      }
    }

    if (isPreview) {
      addToast("Önizleme geçerli görünüyor. Yayınlamak için taslağı kaydedin.", "info");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses, surveyVersionId: versionId }),
      });
      const data = (await response.json()) as { error?: string; id?: string };
      if (!response.ok || !data.id) {
        throw new Error(data.error ?? "Yanıtlar kaydedilemedi.");
      }

      window.localStorage.removeItem(draftStorageKey);
      setSubmissionState({ type: "success", referenceId: data.id });
      scrollToTop();
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : "Yanıtlar kaydedilirken bir hata oluştu.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submissionState.type === "success") {
    return (
      <div className="success-screen">
        <div className="success-screen__header">
          <div className="success-screen__icon">✓</div>
          <div>
            <h2 className="success-screen__title">Yanıtlarınız kaydedildi</h2>
            <p className="success-screen__lead">
              Araştırmaya katılımınız için teşekkür ederiz. Yanıtlarınız anonim olarak
              veritabanına güvenle iletildi.
            </p>
            <p className="success-screen__ref">
              Referans no: <strong>{submissionState.referenceId}</strong>
            </p>
          </div>
        </div>

        <div className="success-screen__actions no-print">
          <button className="primary-button" type="button" onClick={() => window.print()}>
            PDF olarak indir
          </button>
        </div>

        <SurveyResults responses={responses} schema={schema} />
      </div>
    );
  }

  return (
    <>
      {isPreview ? (
        <div className="preview-banner">
          <strong>Canlı önizleme</strong>
          <span>Kaydetmeden önce taslağın akışını ve doğrulamalarını test edin.</span>
        </div>
      ) : null}

      <div
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={progress}
        className="form-progress"
        role="progressbar"
      >
        <div className="form-progress__bar" style={{ width: `${progress}%` }} />
      </div>

      <section id="anket">
        <nav aria-label="Bölüm adımları" className="form-steps">
          {schema.sections.map((section, index) => {
            const isCurrent = index === currentSectionIndex;
            const isCompleted = sectionIsComplete(schema, section, responses);
            return (
              <button
                key={section.id}
                className={`form-step${isCurrent ? " form-step--active" : ""}${isCompleted && !isCurrent ? " form-step--done" : ""}`}
                title={section.title}
                type="button"
                onClick={() => goToSection(index)}
              >
                {index + 1}
              </button>
            );
          })}
        </nav>

        <div className="survey-panel">
          <header className="survey-panel__header">
            <p className="section-eyebrow">{currentSection.eyebrow}</p>
            <h2>{currentSection.title}</h2>
            <p className="survey-panel__description">{currentSection.description}</p>
            <p className="section-counter">
              Bölüm {currentSectionIndex + 1} / {schema.sections.length} · {progress}% tamamlandı
            </p>
          </header>

          <div className="survey-panel__body">
            {currentSection.type === "basic"
              ? currentSection.fields?.map((field) => (
                  <RenderField
                    field={field}
                    key={field.id}
                    onCheckboxToggle={toggleCheckboxValue}
                    onValueChange={updateValue}
                    responses={responses}
                  />
                ))
              : null}
            {currentSection.type === "ffq" ? (
              <FoodFrequencySection
                onValueChange={updateValue}
                responses={responses}
                schema={schema}
              />
            ) : null}
            {currentSection.type === "upf" ? (
              <UltraProcessedSection
                onValueChange={updateValue}
                responses={responses}
                schema={schema}
              />
            ) : null}
          </div>

          <footer className="survey-panel__footer">
            <button
              className="ghost-button"
              disabled={currentSectionIndex === 0 || isNavigating || isSubmitting}
              type="button"
              onClick={handlePrevious}
            >
              Önceki
            </button>
            {currentSectionIndex < schema.sections.length - 1 ? (
              <button
                className="primary-button"
                disabled={isNavigating || isSubmitting}
                type="button"
                onClick={handleNext}
              >
                Sonraki
              </button>
            ) : (
              <button
                className="primary-button"
                disabled={isNavigating || isSubmitting}
                type="button"
                onClick={submitSurvey}
              >
                {isSubmitting
                  ? "Kaydediliyor..."
                  : isPreview
                    ? "Önizlemeyi doğrula"
                    : "Yanıtları kaydet"}
              </button>
            )}
          </footer>
        </div>
      </section>

      {toasts.length > 0 ? (
        <div aria-live="polite" className="toast-container" role="alert">
          {toasts.map((toast) => (
            <div key={toast.id} className={`toast toast--${toast.kind}`}>
              <span>{toast.message}</span>
              <button
                aria-label="Kapat"
                className="toast__close"
                type="button"
                onClick={() => dismissToast(toast.id)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <button
        aria-label="Çalışma hakkında bilgi"
        className="info-btn"
        type="button"
        onClick={() => setInfoOpen(true)}
      >
        i
      </button>

      {infoOpen ? (
        <div className="info-modal-overlay" onClick={() => setInfoOpen(false)}>
          <div className="info-modal" onClick={(event) => event.stopPropagation()}>
            <div className="info-modal__header">
              <h2 className="info-modal__title">Çalışma hakkında</h2>
              <button
                aria-label="Kapat"
                className="info-modal__close"
                type="button"
                onClick={() => setInfoOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="info-section">
              <p className="info-section__title">Kapsam</p>
              <ul>
                <li>Demografik bilgiler ve vardiya düzeni</li>
                <li>Besine erişim, öğün düzensizliği ve tercih edilen yiyecekler</li>
                <li>Besin tüketim sıklığı, Bristol ölçeği, UPF taraması ve PSQI</li>
              </ul>
            </div>

            <hr className="info-divider" />

            <div className="info-section">
              <p className="info-section__title">Bölümlere geç</p>
              <nav className="modal-nav">
                {schema.sections.map((section, index) => {
                  const isCurrent = index === currentSectionIndex;
                  const isCompleted = sectionIsComplete(schema, section, responses);
                  return (
                    <button
                      key={section.id}
                      className={`modal-nav-btn${isCurrent ? " modal-nav-btn--active" : ""}${isCompleted ? " modal-nav-btn--done" : ""}`}
                      type="button"
                      onClick={() => {
                        goToSection(index);
                        setInfoOpen(false);
                      }}
                    >
                      <span className="modal-nav-btn__num">{index + 1}</span>
                      {section.title}
                    </button>
                  );
                })}
              </nav>
            </div>

            <hr className="info-divider" />

            <div className="info-section">
              <p className="info-section__title">Gizlilik</p>
              <p>
                Kimlik bilgisi istenmez. Yanıtlar Supabase veritabanına anonim olarak kaydedilir.
                Mobil ve masaüstü uyumludur.
              </p>
            </div>

            <div className="info-section">
              <p className="info-section__title">Taslak</p>
              <p className="saved-note">
                {isPreview ? "Önizleme modunda yerel taslak tutulmaz." : `Son kayıt: ${formatSavedAt(savedAt)}`}
              </p>
              <button
                className="ghost-button"
                style={{ fontSize: "0.85rem", marginTop: 10, minHeight: 36 }}
                type="button"
                onClick={() => {
                  clearDraft();
                  setInfoOpen(false);
                }}
              >
                {isPreview ? "Yanıtları sıfırla" : "Yerel taslağı temizle"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
