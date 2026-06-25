/**
 * useFormStatus (React 19) — read parent <form> submission status
 *
 * Must be called from a component that is a CHILD of a <form>.
 * It reads the status of the nearest parent form — no props needed.
 *
 *   const { pending, data, action, method } = useFormStatus();
 *
 *   pending — true while the form's action is running
 *   data    — FormData being submitted
 *   action  — reference to the action function/url
 *   method  — "get" or "post"
 *
 * Why not just useState(isSubmitting) in the parent?
 * - useFormStatus works for ANY child of the form — no prop drilling
 * - A reusable <SubmitButton> component automatically knows if ITS
 *   parent form is submitting — works in any form, anywhere
 * - This is the React 19 pattern: build form-status-aware components
 *   once, reuse everywhere
 *
 * IMPORTANT: useFormStatus does NOT work in the same component that
 * renders the <form> — only in a CHILD component.
 *
 * Pattern 1 — Reusable SubmitButton  : auto-disables + shows spinner in ANY form
 * Pattern 2 — Form overlay           : child component shows submitting overlay
 */

import { useFormStatus } from "react-dom";
import { useState } from "react";
import "./UseFormStatus.css";

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 1 — Reusable SubmitButton (works in ANY <form>)
// ═══════════════════════════════════════════════════════════════════════════════

// This component has ZERO props for loading state — it reads it from
// whichever <form> happens to be its parent. Drop it into any form.
function SubmitButton({ children }: { children: React.ReactNode }) {
  // Must be called inside a child of <form> — not in the form's own component
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="submit-btn" disabled={pending}>
      {pending && <span className="spinner-sm" />}
      {pending ? "Submitting..." : children}
    </button>
  );
}

// Simulates a server action — React 19 form actions run this on submit
async function submitContactForm(formData: FormData): Promise<void> {
  await new Promise((r) => setTimeout(r, 1500));
  console.log("Submitted:", Object.fromEntries(formData));
}

function ContactFormDemo() {
  const [submitted, setSubmitted] = useState(false);

  async function handleAction(formData: FormData) {
    await submitContactForm(formData);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="demo__section">
        <p className="demo__label">Pattern 1</p>
        <p className="demo__title">
          Reusable SubmitButton — reads parent form status
        </p>
        <p className="success-msg">✓ Message sent successfully!</p>
        <button
          className="submit-btn"
          style={{
            background: "transparent",
            color: "#6b7280",
            border: "1.5px solid #e5e7eb",
          }}
          onClick={() => setSubmitted(false)}
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 1</p>
      <p className="demo__title">
        Reusable SubmitButton — reads parent form status
      </p>

      {/* action prop — React 19 form actions, runs handleAction on submit */}
      <form
        action={handleAction}
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        <div className="form-row">
          <label className="form-row__label" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            name="name"
            className="field-input"
            placeholder="Rahul"
            required
          />
        </div>
        <div className="form-row">
          <label className="form-row__label" htmlFor="message">
            Message
          </label>
          <input
            id="message"
            name="message"
            className="field-input"
            placeholder="Your message..."
            required
          />
        </div>

        {/* SubmitButton has no props — it finds the form status automatically */}
        <SubmitButton>Send Message</SubmitButton>
      </form>

      <p className="demo__note">
        <code>SubmitButton</code> does not receive a <code>pending</code> prop
        because <code>useFormStatus()</code> automatically reads the submission
        status of the nearest parent <code>&lt;form&gt;</code>. This makes the
        button reusable—you can place the same <code>SubmitButton</code> inside
        any form, and it will automatically reflect that form's pending state
        without requiring additional props.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 2 — Form overlay (child shows submitting state visually)
// ═══════════════════════════════════════════════════════════════════════════════

// Child component — wraps form fields, dims them + shows overlay during submit
function FormStatusOverlay() {
  const { pending, data } = useFormStatus();

  if (!pending) return null;

  return (
    <div className="form-overlay">
      <span
        className="spinner-sm"
        style={{
          borderTopColor: "#6366f1",
          borderColor: "rgba(99,102,241,0.2)",
        }}
      />
      Submitting {data?.get("email") ? String(data.get("email")) : "..."}
    </div>
  );
}

async function subscribeNewsletter(formData: FormData): Promise<void> {
  await new Promise((r) => setTimeout(r, 1800));
  console.log("Subscribed:", formData.get("email"));
}

function NewsletterFormDemo() {
  const [done, setDone] = useState(false);

  async function handleAction(formData: FormData) {
    await subscribeNewsletter(formData);
    setDone(true);
    setTimeout(() => setDone(false), 2000);
  }

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 2</p>
      <p className="demo__title">Form overlay — child shows submitting state</p>

      <div className="form-overlay-wrap">
        <form action={handleAction} style={{ display: "flex", gap: 8 }}>
          <input
            name="email"
            type="email"
            className="field-input"
            placeholder="your@email.com"
            required
          />
          <SubmitButton>Subscribe</SubmitButton>
        </form>

        {/* Overlay component — sibling to inputs, reads same form's status */}
        <FormStatusOverlay />
      </div>

      {done && <p className="success-msg">✓ Subscribed!</p>}

      <div className="compare">
        <div className="compare__cell compare__cell--header">
          Without useFormStatus
        </div>
        <div className="compare__cell compare__cell--header">
          With useFormStatus
        </div>
        <div className="compare__cell compare__cell--bad">
          Parent needs isSubmitting state + pass to every child via props
        </div>
        <div className="compare__cell compare__cell--good">
          Any child reads status directly — zero props ✓
        </div>
      </div>

      <p className="demo__note">
        <code>FormStatusOverlay</code> and <code>SubmitButton</code> can both
        independently read the same form's <code>pending</code> state using{" "}
        <code>useFormStatus()</code>. There is no need to lift the pending state
        into a parent component or pass it down as props, making each component
        self-contained and reusable.
      </p>

      <p className="demo__warning">
        ⚠️ <strong>Import location:</strong> <code>useFormStatus</code> is
        imported from <code>react-dom</code>, not <code>react</code>. It only
        works inside a component that is rendered as a descendant of a{" "}
        <code>&lt;form&gt;</code>. Calling it in the same component that renders
        the <code>&lt;form&gt;</code>
        itself will not work because the hook must be inside the form's
        component tree.
      </p>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function UseFormStatusDemo() {
  return (
    <div className="demo">
      <ContactFormDemo />
      <NewsletterFormDemo />
    </div>
  );
}
