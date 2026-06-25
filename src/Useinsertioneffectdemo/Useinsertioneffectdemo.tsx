/**
 * useInsertionEffect — CSS-in-JS style injection
 *
 * Execution order (earliest to latest):
 *   useInsertionEffect → useLayoutEffect → useEffect
 *
 * When to use:
 * - CSS-in-JS libraries (styled-components, Emotion) internally use this
 * - Inject <style> tags into DOM BEFORE any layout reads happen
 * - Ensures styles are in place before useLayoutEffect measures the DOM
 *
 * When NOT to use:
 * - Application code — this is for library authors only
 * - Cannot read/write refs (DOM not ready yet)
 * - Cannot call setState
 *
 * Real-world: Emotion, styled-components, vanilla-extract use this internally.
 * As an app developer you will almost never use it directly.
 * Knowing it exists + why = enough for interviews.
 *
 * Pattern 1 — Dynamic style injection  : inject CSS rule into <style> tag before paint
 * Pattern 2 — Execution order visual   : shows insertion → layout → effect order
 */

import {
  useState,
  useRef,
  useInsertionEffect,
  useLayoutEffect,
  useEffect,
} from "react";
import "./UseInsertionEffectDemo.css";

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 1 — Dynamic <style> injection (CSS-in-JS simulation)
// ═══════════════════════════════════════════════════════════════════════════════

// Minimal CSS-in-JS: generates a class name and injects the style rule
function useCSS(css: string): string {
  // Stable class name based on css string hash
  const className = `dyn-${Math.abs(
    css.split("").reduce((h, c) => (Math.imul(31, h) + c.charCodeAt(0)) | 0, 0),
  ).toString(36)}`;

  const styleRef = useRef<HTMLStyleElement | null>(null);

  // useInsertionEffect — inject style BEFORE layout reads
  // If useLayoutEffect was used here: style arrives after layout → wrong measurements
  useInsertionEffect(() => {
    // Create <style> tag once
    if (!styleRef.current) {
      styleRef.current = document.createElement("style");
      document.head.appendChild(styleRef.current);
    }

    styleRef.current.textContent = `.${className} { ${css} }`;

    return () => {
      // Cleanup: remove style when component unmounts
      styleRef.current?.remove();
      styleRef.current = null;
    };
  }, [className, css]);

  return className;
}

interface Theme {
  name: string;
  emoji: string;
  bg: string;
  color: string;
  borderColor: string;
}

const THEMES: Theme[] = [
  {
    name: "Ocean",
    emoji: "🌊",
    bg: "#eff6ff",
    color: "#1d4ed8",
    borderColor: "#bfdbfe",
  },
  {
    name: "Forest",
    emoji: "🌿",
    bg: "#f0fdf4",
    color: "#15803d",
    borderColor: "#bbf7d0",
  },
  {
    name: "Sunset",
    emoji: "🌅",
    bg: "#fff7ed",
    color: "#c2410c",
    borderColor: "#fed7aa",
  },
  {
    name: "Violet",
    emoji: "💜",
    bg: "#fdf4ff",
    color: "#7e22ce",
    borderColor: "#e9d5ff",
  },
];

function StyleInjectionDemo() {
  const [themeIdx, setThemeIdx] = useState(0);
  const theme = THEMES[themeIdx];

  // useCSS generates class + injects <style> via useInsertionEffect
  const cls = useCSS(
    `background: ${theme.bg}; color: ${theme.color}; border: 1.5px solid ${theme.borderColor};`,
  );

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 1</p>
      <p className="demo__title">
        Dynamic style injection — CSS-in-JS simulation
      </p>

      <div className="theme-btns">
        {THEMES.map((t, i) => (
          <button
            key={t.name}
            className={`theme-btn${themeIdx === i ? " theme-btn--active" : ""}`}
            onClick={() => setThemeIdx(i)}
          >
            {t.emoji} {t.name}
          </button>
        ))}
      </div>

      {/* className comes from injected <style> tag — no inline styles */}
      <div className={`theme-preview ${cls}`}>
        <p className="theme-preview__title">
          {theme.emoji} {theme.name} Theme
        </p>
        <p className="theme-preview__body">
          Style injected via <code>&lt;style&gt;</code> tag using
          useInsertionEffect.
        </p>
      </div>

      <p className="demo__note">
        <code>useInsertionEffect</code> is used to insert{" "}
        <code>&lt;style&gt;</code>
        elements into the DOM before layout effects run. CSS-in-JS libraries
        such as <code>Emotion</code> and <code>styled-components</code> use this
        mechanism internally to generate unique class names and inject the
        corresponding CSS into the document's <code>&lt;head&gt;</code> before
        the browser performs layout and painting.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 2 — Execution order: insertion → layout → effect
// ═══════════════════════════════════════════════════════════════════════════════

function ExecutionOrderDemo() {
  const [log, setLog] = useState<string[]>([]);
  const [trigger, setTrigger] = useState(0);

  // 1st to run — before DOM mutations are flushed to screen
  useInsertionEffect(() => {
    setLog((prev) => [...prev, "1. useInsertionEffect fired"]);
  }, [trigger]);

  // 2nd to run — after DOM mutations, before browser paint
  useLayoutEffect(() => {
    setLog((prev) => [...prev, "2. useLayoutEffect fired"]);
  }, [trigger]);

  // 3rd to run — after browser paint
  useEffect(() => {
    setLog((prev) => [...prev, "3. useEffect fired"]);
  }, [trigger]);

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 2</p>
      <p className="demo__title">
        Execution order — insertion → layout → effect
      </p>

      <button
        style={{
          height: 34,
          padding: "0 14px",
          fontSize: 13,
          fontWeight: 600,
          background: "#111827",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          fontFamily: "inherit",
          alignSelf: "flex-start",
        }}
        onClick={() => {
          setLog([]);
          setTrigger((t) => t + 1);
        }}
      >
        Trigger all 3 effects
      </button>

      <div className="order-list">
        {[
          {
            label: "useInsertionEffect",
            cls: "insertion",
            timing: "Before DOM flush",
          },
          { label: "useLayoutEffect", cls: "layout", timing: "Before paint" },
          { label: "useEffect", cls: "effect", timing: "After paint" },
        ].map((item, i) => (
          <div
            key={item.label}
            className={`order-item order-item--${item.cls}`}
          >
            <span className="order-item__num">{i + 1}</span>
            <div>
              <code style={{ fontSize: 12 }}>{item.label}</code>
              <p style={{ margin: "2px 0 0", fontSize: 11, opacity: 0.7 }}>
                {item.timing}
              </p>
            </div>
            {log[i] && (
              <span style={{ marginLeft: "auto", fontSize: 11, opacity: 0.7 }}>
                ✓ fired
              </span>
            )}
          </div>
        ))}
      </div>

      <p className="demo__note">
        When all three hooks are used during the same render cycle, they always
        run in this order: <code>useInsertionEffect</code> →{" "}
        <code>useLayoutEffect</code> → <code>useEffect</code>. This execution
        order is guaranteed by React and is part of its official behavior.
      </p>

      <p className="demo__warning">
        ⚠️{" "}
        <strong>
          Do not use <code>useInsertionEffect</code> in application code.
        </strong>{" "}
        It is intended primarily for CSS-in-JS library authors to inject styles
        before layout effects run. Inside <code>useInsertionEffect</code>, you
        should not read or write refs, and you should not call{" "}
        <code>setState</code>.
      </p>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function UseInsertionEffectDemo() {
  return (
    <div className="demo">
      <StyleInjectionDemo />
      <ExecutionOrderDemo />
    </div>
  );
}
