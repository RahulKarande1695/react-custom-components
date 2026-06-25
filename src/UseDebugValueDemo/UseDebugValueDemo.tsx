/**
 * useDebugValue — custom hook debugging in React DevTools
 *
 * useDebugValue adds a label to a custom hook in React DevTools.
 * It has NO effect on the actual behavior — purely for debugging.
 *
 *   useDebugValue(value);
 *   useDebugValue(value, (v) => formatExpensiveLabel(v)); // lazy format
 *
 * When to use:
 * - Custom hooks shared across team / library
 * - When hook state is hard to read in DevTools without context
 *
 * When NOT to use:
 * - Every hook — only hooks worth labeling in DevTools
 * - Simple hooks used in one place
 *
 * Pattern 1 — useFormField   : shows validation state in DevTools
 * Pattern 2 — useFetch       : shows loading/error/data state
 * Pattern 3 — Lazy formatter : expensive format only runs in DevTools
 */

import { useState, useEffect, useDebugValue } from "react";
import type { ChangeEvent } from "react";
import "./UseDebugValueDemo.css";

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 1 — useFormField with validation debug label
// ═══════════════════════════════════════════════════════════════════════════════

interface FieldState {
  value: string;
  valid: boolean;
  error: string;
}

function useFormField(validate: (v: string) => string) {
  const [state, setState] = useState<FieldState>({
    value: "",
    valid: false,
    error: "",
  });

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    const error = validate(value);
    setState({ value, valid: !error, error });
  }

  // DevTools madhe disel: useFormField — "valid ✓" ya "invalid: <error>"
  useDebugValue(state, (s) => (s.valid ? `valid ✓` : `invalid: "${s.error}"`));

  return { ...state, onChange };
}

function FormFieldDemo() {
  const email = useFormField((v) => {
    if (!v) return "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Invalid email";
    return "";
  });

  const name = useFormField((v) => {
    if (!v) return "Required";
    if (v.length < 2) return "Min 2 characters";
    return "";
  });

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 1</p>
      <p className="demo__title">useFormField — validation label in DevTools</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>
            Email
          </label>
          <input
            className="field-input"
            value={email.value}
            onChange={email.onChange}
            placeholder="rahul@example.com"
            type="email"
          />
          {email.error && email.value && (
            <p style={{ fontSize: 12, color: "#ef4444", margin: 0 }}>
              {email.error}
            </p>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>
            Name
          </label>
          <input
            className="field-input"
            value={name.value}
            onChange={name.onChange}
            placeholder="Rahul"
          />
          {name.error && name.value && (
            <p style={{ fontSize: 12, color: "#ef4444", margin: 0 }}>
              {name.error}
            </p>
          )}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <span
            className={`status-pill status-pill--${email.valid ? "valid" : "invalid"}`}
          >
            email: {email.valid ? "valid ✓" : "invalid"}
          </span>
          <span
            className={`status-pill status-pill--${name.valid ? "valid" : "invalid"}`}
          >
            name: {name.valid ? "valid ✓" : "invalid"}
          </span>
        </div>
      </div>

      {/* React DevTools mockup — shows what useDebugValue displays */}
      <div className="devtools-mock">
        <div className="devtools-mock__header">⚛ React DevTools (mock)</div>
        <div className="devtools-mock__body">
          <div className="devtools-row">
            <span className="devtools-key">▾ FormFieldDemo</span>
          </div>
          <div className="devtools-row devtools-row--indent">
            <span className="devtools-hook">useFormField</span>
            <span style={{ color: "#6b7280" }}>—</span>
            <span className="devtools-debug">
              {email.valid
                ? `valid ✓`
                : `invalid: "${email.error || "Required"}"`}
            </span>
          </div>
          <div className="devtools-row devtools-row--indent">
            <span className="devtools-hook">useFormField</span>
            <span style={{ color: "#6b7280" }}>—</span>
            <span className="devtools-debug">
              {name.valid
                ? `valid ✓`
                : `invalid: "${name.error || "Required"}"`}
            </span>
          </div>
        </div>
      </div>
      <p className="demo__note">
        <code>useDebugValue(state, formatter)</code> displays a custom label for
        your custom Hook in React DevTools. The formatter function is evaluated
        only when React DevTools is open, making it ideal for expensive
        formatting logic. Because the formatter is lazily executed, it adds
        virtually no runtime overhead in production builds.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 2 — useFetch with status label
// ═══════════════════════════════════════════════════════════════════════════════

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

function useFetch<T>(url: string): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    setState({ data: null, loading: true, error: null });

    fetch(url, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err) => {
        if (err.name !== "AbortError") {
          setState({ data: null, loading: false, error: err.message });
        }
      });

    return () => controller.abort();
  }, [url]);

  // DevTools madhe disel: useFetch — "loading..." / "error: msg" / "data: User {...}"
  useDebugValue(state, (s) => {
    if (s.loading) return "loading...";
    if (s.error) return `error: ${s.error}`;
    return `data: ${JSON.stringify(s.data).slice(0, 40)}...`;
  });

  return state;
}

interface User {
  id: number;
  name: string;
  email: string;
}

function FetchDemo() {
  const [userId, setUserId] = useState(1);
  const { data, loading, error } = useFetch<User>(
    `https://jsonplaceholder.typicode.com/users/${userId}`,
  );

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 2</p>
      <p className="demo__title">useFetch — fetch status label in DevTools</p>

      <div style={{ display: "flex", gap: 6 }}>
        {[1, 2, 3].map((id) => (
          <button
            key={id}
            onClick={() => setUserId(id)}
            style={{
              height: 34,
              padding: "0 12px",
              fontSize: 13,
              fontWeight: 600,
              border: "1.5px solid #e5e7eb",
              borderRadius: 8,
              background: userId === id ? "#111827" : "#fff",
              color: userId === id ? "#fff" : "#374151",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            User {id}
          </button>
        ))}
      </div>

      <div
        style={{
          padding: "10px 12px",
          background: "#f9fafb",
          borderRadius: 8,
          fontSize: 13,
        }}
      >
        {loading ? (
          "Loading..."
        ) : error ? (
          `Error: ${error}`
        ) : (
          <span>
            {data?.name} — {data?.email}
          </span>
        )}
      </div>

      {/* DevTools mockup */}
      <div className="devtools-mock">
        <div className="devtools-mock__header">⚛ React DevTools (mock)</div>
        <div className="devtools-mock__body">
          <div className="devtools-row">
            <span className="devtools-key">▾ FetchDemo</span>
          </div>
          <div className="devtools-row devtools-row--indent">
            <span className="devtools-hook">useFetch</span>
            <span style={{ color: "#6b7280" }}>—</span>
            <span className="devtools-debug">
              {loading
                ? "loading..."
                : error
                  ? `error: ${error}`
                  : `data: ${JSON.stringify(data).slice(0, 35)}...`}
            </span>
          </div>
        </div>
      </div>

      <p className="demo__note">
        Without <code>useDebugValue</code>, React DevTools only displays the raw
        Hook state, such as <code>{`{ loading: true }`}</code>, which provides
        little context. With <code>useDebugValue</code>, your custom Hook can
        display meaningful labels like <code>useFetch — "loading..."</code> or{" "}
        <code>{`"data: { name: ... }"`}</code>, making it much easier to
        understand the Hook's current state while debugging.
      </p>

      <p className="demo__warning">
        ⚠️ <strong>No production performance cost:</strong> When you provide the
        optional formatter function as the second argument to{" "}
        <code>useDebugValue</code>, it is evaluated lazily and runs only when
        React DevTools is open. Since React DevTools are not available in
        production builds, this approach introduces virtually zero runtime
        overhead.
      </p>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function UseDebugValueDemo() {
  return (
    <div className="demo">
      <FormFieldDemo />
      <FetchDemo />
    </div>
  );
}
