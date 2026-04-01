"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import {
  DRAFT_STORAGE_KEY,
  ffqKey,
  foodFrequencyCategories,
  frequencyOptions,
  getArrayValue,
  getTextValue,
  isValuePresent,
  matrixKey,
  surveySections,
  type CheckboxField,
  type MatrixField,
  type SurveyField,
  type SurveyResponses,
  type SurveySection,
  ultraProcessedItems,
  upfKey,
} from "@/lib/survey";

type SubmissionState =
  | { type: "idle" }
  | { type: "success"; referenceId: string };

type Toast = { id: number; message: string; kind: "warning" | "error" };

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

const isCheckboxField = (field: SurveyField): field is CheckboxField => field.type === "checkbox";
const isMatrixField = (field: SurveyField): field is MatrixField => field.type === "matrix";

const getFieldValidationMessage = (
  field: SurveyField,
  responses: SurveyResponses,
): string | null => {
  if (!field.required) return null;

  if (isMatrixField(field)) {
    const missingRow = field.rows.find(
      (row) => !isValuePresent(responses[matrixKey(field.key, row.key)]),
    );
    return missingRow
      ? `"${field.label}" bölümünde "${missingRow.label}" satırını doldurun.`
      : null;
  }

  if (isCheckboxField(field)) {
    return getArrayValue(responses, field.key).length > 0
      ? null
      : `"${field.label}" sorusunda en az bir seçim yapın.`;
  }

  return isValuePresent(responses[field.key]) ? null : `"${field.label}" alanını doldurun.`;
};

const getSectionValidationMessage = (
  section: SurveySection,
  responses: SurveyResponses,
): string | null => {
  if (section.type === "ffq") {
    for (const category of foodFrequencyCategories) {
      for (const item of category.items) {
        const frequency = getTextValue(responses, ffqKey(item.id, "frequency"));
        const portion = getTextValue(responses, ffqKey(item.id, "portion"));
        if (!frequency) return `"${item.label}" için tüketim sıklığını seçin.`;
        if (frequency !== "never" && !portion)
          return `"${item.label}" için bir seferde tüketilen miktarı yazın.`;
      }
    }
    return null;
  }

  if (section.type === "upf") {
    const missingItem = ultraProcessedItems.find(
      (item) => !isValuePresent(responses[upfKey(item.id)]),
    );
    return missingItem ? `"${missingItem.group}" için Evet/Hayır seçimi yapın.` : null;
  }

  for (const field of section.fields ?? []) {
    const msg = getFieldValidationMessage(field, responses);
    if (msg) return msg;
  }

  if (section.id === "participant") {
    if (getTextValue(responses, "consent") !== "yes")
      return "Yanıtları kaydetmek için anonim araştırma kullanım onayı gereklidir.";
    if (getTextValue(responses, "gender") === "other" && !getTextValue(responses, "gender_other"))
      return '"Diğer cinsiyet açıklaması" alanını doldurun.';
  }

  if (
    section.id === "stress" &&
    getTextValue(responses, "port_habit_change") === "yes" &&
    !getTextValue(responses, "port_habit_change_note")
  )
    return '"Limanlara yanaşıldığında beslenme alışkanlığınız değişir mi?" sorusu için kısa bir açıklama yazın.';

  if (
    section.id === "food-access" &&
    getArrayValue(responses, "snack_reasons").includes("other") &&
    !getTextValue(responses, "snack_reasons_other")
  )
    return '"Diğer neden açıklaması" alanını doldurun.';

  if (section.id === "preferences") {
    if (
      getArrayValue(responses, "cooking_methods").includes("other") &&
      !getTextValue(responses, "cooking_methods_other")
    )
      return '"Diğer pişirme yöntemi" alanını doldurun.';
    if (
      getTextValue(responses, "oil_type") === "other" &&
      !getTextValue(responses, "oil_type_other")
    )
      return '"Diğer yağ türü" alanını doldurun.';
    if (
      getArrayValue(responses, "preferred_snacks").includes("other") &&
      !getTextValue(responses, "preferred_snacks_other")
    )
      return '"Diğer atıştırmalık" alanını doldurun.';
  }

  if (
    section.id === "sleep" &&
    getTextValue(responses, matrixKey("sleep_problems", "other")) !== "0" &&
    !getTextValue(responses, "sleep_other_reason")
  )
    return '"Diğer uyku sorunu nedeni" alanını doldurun.';

  return null;
};

const sectionIsComplete = (section: SurveySection, responses: SurveyResponses) =>
  getSectionValidationMessage(section, responses) === null;

type RenderFieldProps = {
  field: SurveyField;
  responses: SurveyResponses;
  onValueChange: (key: string, value: string) => void;
  onCheckboxToggle: (field: CheckboxField, optionValue: string) => void;
};

function RenderField({ field, responses, onValueChange, onCheckboxToggle }: RenderFieldProps) {
  if (field.type === "text" || field.type === "number" || field.type === "time") {
    return (
      <label className="question-card">
        <span className="question-card__label">
          {field.label}
          {field.required ? <span className="required-mark">*</span> : null}
        </span>
        {field.description ? (
          <span className="question-card__description">{field.description}</span>
        ) : null}
        <input
          className="input-control"
          min={field.min}
          max={field.max}
          step={field.step}
          type={field.type}
          value={getTextValue(responses, field.key)}
          placeholder={field.placeholder}
          onChange={(e) => onValueChange(field.key, e.target.value)}
        />
      </label>
    );
  }

  if (field.type === "textarea") {
    return (
      <label className="question-card">
        <span className="question-card__label">{field.label}</span>
        {field.description ? (
          <span className="question-card__description">{field.description}</span>
        ) : null}
        <textarea
          className="textarea-control"
          rows={4}
          value={getTextValue(responses, field.key)}
          placeholder={field.placeholder}
          onChange={(e) => onValueChange(field.key, e.target.value)}
        />
      </label>
    );
  }

  if (field.type === "radio") {
    return (
      <fieldset className="question-card">
        <legend className="question-card__label">
          {field.label}
          {field.required ? <span className="required-mark">*</span> : null}
        </legend>
        {field.description ? (
          <p className="question-card__description">{field.description}</p>
        ) : null}
        <div className={`option-grid option-grid--${field.columns ?? 2}`}>
          {field.options.map((option) => (
            <label className="option-card" key={option.value}>
              <input
                checked={getTextValue(responses, field.key) === option.value}
                name={field.key}
                type="radio"
                value={option.value}
                onChange={(e) => onValueChange(field.key, e.target.value)}
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
          {field.required ? <span className="required-mark">*</span> : null}
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
                key={option.value}
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
          {field.required ? <span className="required-mark">*</span> : null}
        </legend>
        {field.description ? (
          <p className="question-card__description">{field.description}</p>
        ) : null}
        <div className="matrix-grid">
          <div className="matrix-grid__header">
            <span className="matrix-grid__header-spacer">Durum</span>
            {field.columns.map((col) => (
              <span className="matrix-grid__header-cell" key={col.value}>
                {col.label}
              </span>
            ))}
          </div>
          {field.rows.map((row) => (
            <div className="matrix-grid__row" key={row.key}>
              <span className="matrix-grid__row-label">{row.label}</span>
              <div className="matrix-grid__choices">
                {field.columns.map((col) => (
                  <label className="matrix-grid__choice" key={col.value}>
                    <input
                      checked={
                        getTextValue(responses, matrixKey(field.key, row.key)) === col.value
                      }
                      name={matrixKey(field.key, row.key)}
                      type="radio"
                      value={col.value}
                      onChange={(e) =>
                        onValueChange(matrixKey(field.key, row.key), e.target.value)
                      }
                    />
                    <span>{col.label}</span>
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
  responses,
  onValueChange,
}: {
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
      {foodFrequencyCategories.map((category) => (
        <section className="ffq-category" key={category.id}>
          <header className="ffq-category__header">
            <h3>{category.title}</h3>
            <span>{category.items.length} besin satırı</span>
          </header>
          <div className="ffq-items">
            {category.items.map((item) => {
              const frequency = getTextValue(responses, ffqKey(item.id, "frequency"));
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
                        onChange={(e) => onValueChange(ffqKey(item.id, "frequency"), e.target.value)}
                      >
                        <option value="">Seçiniz</option>
                        {frequencyOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
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
                        value={getTextValue(responses, ffqKey(item.id, "portion"))}
                        onChange={(e) => onValueChange(ffqKey(item.id, "portion"), e.target.value)}
                      />
                    </label>
                    <label className="question-card question-card--compact">
                      <span className="question-card__label">Günlük karşılığı</span>
                      <input
                        className="input-control"
                        placeholder="İsteğe bağlı"
                        type="text"
                        value={getTextValue(responses, ffqKey(item.id, "daily"))}
                        onChange={(e) => onValueChange(ffqKey(item.id, "daily"), e.target.value)}
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
  responses,
  onValueChange,
}: {
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
        {ultraProcessedItems.map((item) => (
          <article className="upf-card" key={item.id}>
            <div>
              <p className="upf-card__group">{item.group}</p>
              <p className="upf-card__foods">{item.foods}</p>
              <p className="upf-card__threshold">Eşik: {item.threshold}</p>
            </div>
            <div className="option-grid option-grid--2">
              <label className="option-card">
                <input
                  checked={getTextValue(responses, upfKey(item.id)) === "yes"}
                  name={upfKey(item.id)}
                  type="radio"
                  value="yes"
                  onChange={(e) => onValueChange(upfKey(item.id), e.target.value)}
                />
                <span className="option-card__content">
                  <span className="option-card__label">Evet</span>
                </span>
              </label>
              <label className="option-card">
                <input
                  checked={getTextValue(responses, upfKey(item.id)) === "no"}
                  name={upfKey(item.id)}
                  type="radio"
                  value="no"
                  onChange={(e) => onValueChange(upfKey(item.id), e.target.value)}
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

export function SurveyForm() {
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
    setToasts((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  };

  const dismissToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  useEffect(() => {
    const rawDraft = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!rawDraft) return;
    try {
      const parsed = JSON.parse(rawDraft) as {
        responses?: SurveyResponses;
        currentSectionIndex?: number;
        savedAt?: number;
      };
      setResponses(parsed.responses ?? {});
      setCurrentSectionIndex(
        Math.min(parsed.currentSectionIndex ?? 0, surveySections.length - 1),
      );
      setSavedAt(parsed.savedAt ?? null);
    } catch {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
    hasHydratedDraft.current = true;
  }, []);

  useEffect(() => {
    if (!hasHydratedDraft.current) return;
    if (skipNextDraftSave.current) {
      skipNextDraftSave.current = false;
      return;
    }
    const now = Date.now();
    window.localStorage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify({ responses, currentSectionIndex, savedAt: now }),
    );
    setSavedAt(now);
  }, [currentSectionIndex, responses]);

  const currentSection = surveySections[currentSectionIndex];
  const completedSections = surveySections.filter((s) => sectionIsComplete(s, responses)).length;
  const progress = Math.round((completedSections / surveySections.length) * 100);

  const updateValue = (key: string, value: string) => {
    setResponses((current) => ({ ...current, [key]: value }));
  };

  const toggleCheckboxValue = (field: CheckboxField, optionValue: string) => {
    setResponses((current) => {
      const selected = getArrayValue(current, field.key);
      const hasValue = selected.includes(optionValue);
      let nextSelection = hasValue
        ? selected.filter((v) => v !== optionValue)
        : [...selected, optionValue];
      if (optionValue === "none" && !hasValue) nextSelection = ["none"];
      else if (optionValue !== "none") nextSelection = nextSelection.filter((v) => v !== "none");
      return { ...current, [field.key]: nextSelection };
    });
  };

  const goToSection = (index: number) => {
    if (index > currentSectionIndex) {
      const msg = getSectionValidationMessage(currentSection, responses);
      if (msg) { addToast(msg, "warning"); return; }
    }
    startNavigation(() => { setCurrentSectionIndex(index); scrollToTop(); });
  };

  const handleNext = () => {
    const msg = getSectionValidationMessage(currentSection, responses);
    if (msg) { addToast(msg, "warning"); return; }
    startNavigation(() => {
      setCurrentSectionIndex((i) => Math.min(i + 1, surveySections.length - 1));
      scrollToTop();
    });
  };

  const handlePrevious = () => {
    startNavigation(() => {
      setCurrentSectionIndex((i) => Math.max(i - 1, 0));
      scrollToTop();
    });
  };

  const clearDraft = () => {
    skipNextDraftSave.current = true;
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    setResponses({});
    setCurrentSectionIndex(0);
    setToasts([]);
    setSubmissionState({ type: "idle" });
    setSavedAt(null);
    scrollToTop();
  };

  const submitSurvey = async () => {
    for (let i = 0; i < surveySections.length; i++) {
      const msg = getSectionValidationMessage(surveySections[i], responses);
      if (msg) {
        setCurrentSectionIndex(i);
        addToast(msg, "warning");
        scrollToTop();
        return;
      }
    }
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses }),
      });
      const data = (await response.json()) as { error?: string; id?: string };
      if (!response.ok || !data.id) throw new Error(data.error ?? "Yanıtlar kaydedilemedi.");
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
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
        <div className="success-screen__icon">✓</div>
        <h2 className="success-screen__title">Yanıtlarınız kaydedildi</h2>
        <p className="success-screen__lead">
          Araştırmaya katılımınız için teşekkür ederiz. Yanıtlarınız anonim olarak
          veritabanına güvenle iletildi.
        </p>
        <p className="success-screen__ref">
          Referans no: <strong>{submissionState.referenceId}</strong>
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        className="form-progress"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="form-progress__bar" style={{ width: `${progress}%` }} />
      </div>

      <section id="anket">
        <nav className="form-steps" aria-label="Bölüm adımları">
          {surveySections.map((section, index) => {
            const isCurrent = index === currentSectionIndex;
            const isCompleted = sectionIsComplete(section, responses);
            return (
              <button
                key={section.id}
                className={`form-step${isCurrent ? " form-step--active" : ""}${isCompleted && !isCurrent ? " form-step--done" : ""}`}
                type="button"
                title={section.title}
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
              Bölüm {currentSectionIndex + 1} / {surveySections.length} · {progress}% tamamlandı
            </p>
          </header>

          <div className="survey-panel__body">
            {currentSection.type === "basic"
              ? currentSection.fields?.map((field) => (
                  <RenderField
                    field={field}
                    key={field.key}
                    onCheckboxToggle={toggleCheckboxValue}
                    onValueChange={updateValue}
                    responses={responses}
                  />
                ))
              : null}
            {currentSection.type === "ffq" ? (
              <FoodFrequencySection onValueChange={updateValue} responses={responses} />
            ) : null}
            {currentSection.type === "upf" ? (
              <UltraProcessedSection onValueChange={updateValue} responses={responses} />
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
            {currentSectionIndex < surveySections.length - 1 ? (
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
                {isSubmitting ? "Kaydediliyor..." : "Yanıtları kaydet"}
              </button>
            )}
          </footer>
        </div>
      </section>

      {/* Toast container */}
      {toasts.length > 0 ? (
        <div className="toast-container" role="alert" aria-live="polite">
          {toasts.map((toast) => (
            <div key={toast.id} className={`toast toast--${toast.kind}`}>
              <span>{toast.message}</span>
              <button
                className="toast__close"
                type="button"
                aria-label="Kapat"
                onClick={() => dismissToast(toast.id)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {/* Info button */}
      <button
        className="info-btn"
        type="button"
        aria-label="Çalışma hakkında bilgi"
        onClick={() => setInfoOpen(true)}
      >
        i
      </button>

      {/* Info modal */}
      {infoOpen ? (
        <div className="info-modal-overlay" onClick={() => setInfoOpen(false)}>
          <div className="info-modal" onClick={(e) => e.stopPropagation()}>
            <div className="info-modal__header">
              <h2 className="info-modal__title">Çalışma hakkında</h2>
              <button
                className="info-modal__close"
                type="button"
                aria-label="Kapat"
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
                {surveySections.map((section, index) => {
                  const isCurrent = index === currentSectionIndex;
                  const isCompleted = sectionIsComplete(section, responses);
                  return (
                    <button
                      key={section.id}
                      className={`modal-nav-btn${isCurrent ? " modal-nav-btn--active" : ""}${isCompleted ? " modal-nav-btn--done" : ""}`}
                      type="button"
                      onClick={() => { goToSection(index); setInfoOpen(false); }}
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
              <p className="saved-note">Son kayıt: {formatSavedAt(savedAt)}</p>
              <button
                className="ghost-button"
                type="button"
                style={{ marginTop: 10, fontSize: "0.85rem", minHeight: 36 }}
                onClick={() => { clearDraft(); setInfoOpen(false); }}
              >
                Yerel taslağı temizle
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
