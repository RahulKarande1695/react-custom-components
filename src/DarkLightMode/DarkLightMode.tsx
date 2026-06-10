/**
 * ThemeToggle — CSS custom properties based dark/light mode
 *
 * How it works:
 * - CSS tokens are defined on :root (light) and [data-theme="dark"] (dark)
 * - Toggling sets data-theme on <html> — every token swaps automatically
 * - No inline styles, no class juggling — just one attribute flip
 *
 * Why data-theme on <html> instead of a wrapper div:
 * - Tokens need to cascade from the very root so modals, portals,
 *   and anything rendered outside the React tree also pick up the theme
 *
 * Why localStorage:
 * - Persists the user's choice across page refreshes
 * - Checked before first render to avoid a flash of wrong theme
 */

import { useState, useEffect } from "react";
import "./darkLightMode.css";

// ─── Hook ─────────────────────────────────────────────────────────────────────

function useTheme() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    // 1. Respect saved preference
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    // 2. Fall back to OS preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    // Single source of truth: one attribute on <html>
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggle = () => setIsDark((prev) => !prev);

  return { isDark, toggle };
}

// ─── Toggle button ────────────────────────────────────────────────────────────

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`toggle${isDark ? " toggle--active" : ""}`}
      onClick={onToggle}
    >
      {/* Decorative — hidden from screen readers, aria-label covers it */}
      <span className="toggle__track" aria-hidden />
      <span className="toggle__thumb" aria-hidden>
        {isDark ? "🌙" : "☀️"}
      </span>
    </button>
  );
}

// ─── Demo ─────────────────────────────────────────────────────────────────────

export default function DarkLightMode() {
  const { isDark, toggle } = useTheme();

  return (
    <div className="demo">
      <div className="card">
        <div className="card__header">
          <h1 className="card__title">Theme toggle</h1>
          <ThemeToggle isDark={isDark} onToggle={toggle} />
        </div>
        <div className="card__body">
          <span className="card__tag">
            <span className="card__dot" />
            {isDark ? "Dark mode" : "Light mode"}
          </span>
          <div className="card__line" />
          <div className="card__line card__line--short" />
          <div className="card__line" />
        </div>
      </div>
    </div>
  );
}