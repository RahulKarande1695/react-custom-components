/**
 * DynamicForm — Multistep Controlled Form
 *
 * Patterns used:
 * - Controlled form: text/select/textarea → React state (day-to-day standard)
 * - Uncontrolled: file input → useRef (DOM ला handle करू देतो, sync नको)
 * - Field config array → dynamic rendering (map करून fields बनवतो)
 * - Per-step validation before next step
 * - aria-label, aria-describedby, aria-invalid, aria-live → blind users साठी
 * - htmlFor + id link → label click केल्यावर input focus होतो
 */

import { useState, useRef } from "react";
import type { ChangeEvent, FormEvent } from "react";
import "./DynamicForm.css";

// ─── Types ────────────────────────────────────────────────────────────────────

type FieldType = "text" | "email" | "select" | "radio" | "textarea" | "checkbox" | "file";

interface FieldOption {
  label: string;
  value: string;
}

interface Field {
  id: string;
  type: FieldType;
  label: string;
  description?: string;        // aria-describedby
  placeholder?: string;
  required?: boolean;
  options?: FieldOption[];     // select / radio
}

interface Step {
  title: string;
  description: string;
  fields: Field[];
}

// ─── Form config ──────────────────────────────────────────────────────────────
// Field config बदला की form बदलतो — component ला touch नाही

const STEPS: Step[] = [
  {
    title: "Basic info",
    description: "Tell us a bit about yourself.",
    fields: [
      { id: "name",  type: "text",  label: "Full name",  placeholder: "Rahul Patil", required: true },
      { id: "email", type: "email", label: "Email",      placeholder: "rahul@example.com", required: true,
        description: "We'll send updates here." },
      { id: "role",  type: "select", label: "Applying for", required: true,
        options: [
          { label: "Select a role", value: "" },
          { label: "Frontend Developer", value: "frontend" },
          { label: "Backend Developer",  value: "backend" },
          { label: "Full Stack",         value: "fullstack" },
        ],
      },
    ],
  },
  {
    title: "Experience",
    description: "Help us understand your background.",
    fields: [
      { id: "experience", type: "radio", label: "Years of experience", required: true,
        options: [
          { label: "0 – 1 year",  value: "0-1" },
          { label: "1 – 3 years", value: "1-3" },
          { label: "3 – 5 years", value: "3-5" },
          { label: "5+ years",    value: "5+" },
        ],
      },
      { id: "about", type: "textarea", label: "About yourself",
        placeholder: "What you've built, what you love...", required: true,
        description: "Keep it under 300 words." },
    ],
  },
  {
    title: "Finish",
    description: "Last step — review and submit.",
    fields: [
      // File → uncontrolled (useRef), value React मध्ये track नाही
      { id: "resume", type: "file", label: "Resume (PDF)", description: "Max 2 MB." },
      { id: "agree",  type: "checkbox", label: "I agree to the terms and conditions.", required: true },
    ],
  },
];

// ─── State shape ──────────────────────────────────────────────────────────────
// Real-life standard: flat object { fieldId: value }
// Complex forms मध्ये याच shape ला Zod / Yup validate करतात

type FormValues = Record<string, string | boolean>;

function buildInitialValues(steps: Step[]): FormValues {
  const values: FormValues = {};
  steps.forEach((step) =>
    step.fields.forEach((f) => {
      values[f.id] = f.type === "checkbox" ? false : "";
    })
  );
  return values;
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateStep(step: Step, values: FormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  step.fields.forEach((f) => {
    if (!f.required) return;
    const val = values[f.id];
    if (f.type === "checkbox" && val !== true) {
      errors[f.id] = "This field is required.";
    } else if (f.type !== "checkbox" && !String(val).trim()) {
      errors[f.id] = "This field is required.";
    } else if (f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val))) {
      errors[f.id] = "Enter a valid email address.";
    }
  });
  return errors;
}

// ─── Field renderer ───────────────────────────────────────────────────────────

interface FieldProps {
  field: Field;
  value: string | boolean;
  error?: string;
  onChange: (id: string, value: string | boolean) => void;
  fileRef?: React.RefObject<HTMLInputElement | null>;
}

function FormField({ field, value, error, onChange, fileRef }: FieldProps) {
  const descId = field.description ? `${field.id}-desc` : undefined;
  const errId  = error ? `${field.id}-err` : undefined;
  // aria-describedby: description + error दोन्ही link करतो
  const describedBy = [descId, errId].filter(Boolean).join(" ") || undefined;
  const hasError = Boolean(error);

  return (
    <div className="form-field">
      {/* Label — htmlFor → id link */}
      {field.type !== "checkbox" && (
        <label
          htmlFor={field.type === "radio" ? undefined : field.id}
          className={`form-field__label${field.required ? " form-field__label--required" : ""}`}
          id={field.type === "radio" ? `${field.id}-label` : undefined}
        >
          {field.label}
        </label>
      )}

      {field.description && (
        <p id={descId} className="form-field__desc">{field.description}</p>
      )}

      {/* text / email */}
      {(field.type === "text" || field.type === "email") && (
        <input
          id={field.id}
          type={field.type}
          className={`form-field__input${hasError ? " form-field__input--error" : ""}`}
          value={value as string}
          placeholder={field.placeholder}
          required={field.required}
          aria-required={field.required}
          aria-invalid={hasError}
          aria-describedby={describedBy}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(field.id, e.target.value)}
        />
      )}

      {/* select */}
      {field.type === "select" && (
        <select
          id={field.id}
          className={`form-field__select${hasError ? " form-field__select--error" : ""}`}
          value={value as string}
          required={field.required}
          aria-required={field.required}
          aria-invalid={hasError}
          aria-describedby={describedBy}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(field.id, e.target.value)}
        >
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )}

      {/* radio — fieldset + legend = accessible group */}
      {field.type === "radio" && (
        <fieldset
          role="group"
          aria-labelledby={`${field.id}-label`}
          aria-describedby={describedBy}
          style={{ border: "none", padding: 0, margin: 0 }}
        >
          <div className="form-field__radio-group">
            {field.options?.map((opt) => (
              <label key={opt.value} className="form-field__radio-option">
                <input
                  type="radio"
                  name={field.id}
                  value={opt.value}
                  checked={value === opt.value}
                  aria-invalid={hasError}
                  onChange={() => onChange(field.id, opt.value)}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {/* textarea */}
      {field.type === "textarea" && (
        <textarea
          id={field.id}
          className={`form-field__textarea${hasError ? " form-field__textarea--error" : ""}`}
          value={value as string}
          placeholder={field.placeholder}
          rows={4}
          required={field.required}
          aria-required={field.required}
          aria-invalid={hasError}
          aria-describedby={describedBy}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(field.id, e.target.value)}
        />
      )}

      {/* file — uncontrolled, useRef वापरतो */}
      {field.type === "file" && (
        <input
          id={field.id}
          type="file"
          accept=".pdf"
          ref={fileRef}
          aria-describedby={describedBy}
          className="form-field__input"
          style={{ padding: "7px 12px", height: "auto" }}
        />
      )}

      {/* checkbox */}
      {field.type === "checkbox" && (
        <label className="form-field__checkbox-wrap">
          <input
            id={field.id}
            type="checkbox"
            checked={value as boolean}
            aria-required={field.required}
            aria-invalid={hasError}
            aria-describedby={describedBy}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(field.id, e.target.checked)}
          />
          <span className={field.required ? "form-field__label--required" : ""}>{field.label}</span>
        </label>
      )}

      {/* Error — aria-live region: screen reader ला announce होतो */}
      {error && (
        <p id={errId} className="form-field__error" role="alert" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function Progress({ steps, current }: { steps: Step[]; current: number }) {
  return (
    <nav className="form-progress" aria-label="Form progress">
      {steps.map((step, idx) => {
        const isDone   = idx < current;
        const isActive = idx === current;
        return (
          <div
            key={step.title}
            className={`form-progress__step${isActive ? " form-progress__step--active" : ""}${isDone ? " form-progress__step--done" : ""}`}
            aria-current={isActive ? "step" : undefined}
          >
            <div className="form-progress__dot" aria-hidden>
              {isDone ? "✓" : idx + 1}
            </div>
            <span className="form-progress__label">{step.title}</span>
          </div>
        );
      })}
    </nav>
  );
}

// ─── DynamicForm ──────────────────────────────────────────────────────────────

export function DynamicForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [values, setValues]           = useState<FormValues>(buildInitialValues(STEPS));
  const [errors, setErrors]           = useState<Record<string, string>>({});
  const [submitted, setSubmitted]     = useState(false);

  // File input uncontrolled ref
  const fileRef = useRef<HTMLInputElement>(null);

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

  function handleChange(id: string, value: string | boolean) {
    setValues((prev) => ({ ...prev, [id]: value }));
    // Field बदलताच त्या field चा error clear करतो
    if (errors[id]) setErrors((prev) => { const e = { ...prev }; delete e[id]; return e; });
  }

  function handleNext() {
    const stepErrors = validateStep(step, values);
    if (Object.keys(stepErrors).length) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setCurrentStep((s) => s + 1);
  }

  function handleBack() {
    setErrors({});
    setCurrentStep((s) => s - 1);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const stepErrors = validateStep(step, values);
    if (Object.keys(stepErrors).length) {
      setErrors(stepErrors);
      return;
    }
    // File uncontrolled ref मधून मिळतो
    const file = fileRef.current?.files?.[0];
    console.log("Submitted:", { ...values, resume: file?.name ?? null });
    setSubmitted(true);
  }

  function handleReset() {
    setValues(buildInitialValues(STEPS));
    setErrors({});
    setCurrentStep(0);
    setSubmitted(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  if (submitted) {
    return (
      <div className="form-shell">
        <div className="form-card">
          <div className="form-success">
            <div className="form-success__icon" aria-hidden>✓</div>
            <h2 className="form-success__title">Application sent!</h2>
            <p className="form-success__desc">We'll get back to you within 3 business days.</p>
            <button className="form-btn form-btn--ghost" onClick={handleReset}>
              Submit another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-shell">
      <div className="form-card">
        <Progress steps={STEPS} current={currentStep} />

        <header className="form-header">
          <h1 className="form-header__title">{step.title}</h1>
          <p className="form-header__desc">{step.description}</p>
        </header>

        {/* noValidate — browser validation बंद, आपली custom validation वापरतो */}
        <form onSubmit={isLast ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} noValidate>
          <div className="form-fields">
            {step.fields.map((field) => (
              <FormField
                key={field.id}
                field={field}
                value={values[field.id]}
                error={errors[field.id]}
                onChange={handleChange}
                fileRef={field.type === "file" ? fileRef : undefined}
              />
            ))}
          </div>

          <div className="form-actions">
            {currentStep > 0 ? (
              <button type="button" className="form-btn form-btn--ghost" onClick={handleBack}>
                Back
              </button>
            ) : (
              <span />
            )}
            <button type="submit" className="form-btn form-btn--primary">
              {isLast ? "Submit" : "Next →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DynamicForm;