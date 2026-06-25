/**
 * useDebounce — custom hook (not built into React)
 *
 * Delays updating a value until the user STOPS changing it for a set time.
 * Classic use: search input — don't fire API on every keystroke,
 * wait until user pauses typing.
 *
 *   const debouncedValue = useDebounce(value, delay);
 *
 * How it works internally:
 * - useEffect with setTimeout — sets debounced value after `delay` ms
 * - Cleanup clears the timeout if value changes before delay completes
 * - Net effect: only the LAST value in a rapid burst survives
 *
 * Debounce vs Throttle (important interview distinction):
 * ┌───────────┬─────────────────────────────┬─────────────────────────────┐
 * │           │  Debounce                    │  Throttle                    │
 * ├───────────┼─────────────────────────────┼─────────────────────────────┤
 * │ Behavior  │ Wait for pause, then fire 1x  │ Fire at most once per interval│
 * │ Use case  │ Search input, form validation │ Scroll, resize, mouse move    │
 * │ Result    │ Only last call matters        │ Every Nth call matters        │
 * └───────────┴─────────────────────────────┴─────────────────────────────┘
 *
 * Pattern 1 — Search input    : debounced API call counter vs instant counter
 * Pattern 2 — Live preview    : debounced value used for expensive render
 */

import { useState, useEffect, useRef } from "react";
import "./UseDebounceDemo.css";

// ═══════════════════════════════════════════════════════════════════════════════
// The custom hook itself
// ═══════════════════════════════════════════════════════════════════════════════

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    // Schedule update after `delay` ms
    const timeoutId = setTimeout(() => setDebounced(value), delay);

    // If value changes again before delay completes, cancel the old timeout
    // This is what makes it "debounce" — only the last call in a burst survives
    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  return debounced;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 1 — Search input: instant vs debounced call count
// ═══════════════════════════════════════════════════════════════════════════════

function SearchCallCountDemo() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);

  const instantCalls = useRef(0);
  const debouncedCalls = useRef(0);
  const lastQuery = useRef("");

  // Every keystroke — instant call count increments
  if (query !== lastQuery.current) {
    instantCalls.current += 1;
    lastQuery.current = query;
  }

  // Only fires when debouncedQuery actually changes (after user pauses)
  useEffect(() => {
    if (debouncedQuery) debouncedCalls.current += 1;
  }, [debouncedQuery]);

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 1</p>
      <p className="demo__title">
        Search input — instant vs debounced API calls
      </p>

      <input
        className="field-input"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type fast, then pause..."
      />

      <div className="call-log">
        <div className="call-row call-row--instant">
          <span className="call-label">Without debounce (every keystroke)</span>
          <span className="call-count">{instantCalls.current}</span>
        </div>
        <div className="call-row call-row--debounced">
          <span className="call-label">With debounce (500ms pause)</span>
          <span className="call-count">{debouncedCalls.current}</span>
        </div>
      </div>

      <div className="api-result">
        Would call API with: <strong>"{debouncedQuery}"</strong>
      </div>

      <p className="demo__note">
        If you quickly type 20 characters, <strong>Without debounce</strong> the
        counter increases 20 times—once for every keystroke.{" "}
        <strong>With debounce</strong>, the counter increases only once, 500ms
        after typing stops. In real-world applications, this debounced value is
        typically used for API requests, reducing unnecessary server calls and
        improving performance.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 2 — Live preview with debounced expensive render
// ═══════════════════════════════════════════════════════════════════════════════

// Simulates expensive markdown-to-HTML style processing
function expensiveRender(text: string): string {
  let dummy = 0;
  for (let i = 0; i < text.length * 5000; i++) dummy += i;
  return text
    .split(" ")
    .map((w) => (w.length > 5 ? `**${w}**` : w))
    .join(" ");
}

function LivePreviewDemo() {
  const [text, setText] = useState("Type something to see live preview...");
  const debouncedText = useDebounce(text, 400);
  const renderCount = useRef(0);

  const preview = expensiveRender(debouncedText);
  if (debouncedText) renderCount.current; // tracked via effect below

  useEffect(() => {
    renderCount.current += 1;
  }, [debouncedText]);

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 2</p>
      <p className="demo__title">Live preview — debounced expensive render</p>

      <input
        className="field-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="api-result" style={{ minHeight: 50 }}>
        {preview}
      </div>

      <p className="demo__note">
        <code>expensiveRender</code> runs only when <code>debouncedText</code>{" "}
        changes, not on every keystroke. This keeps the input responsive and
        smooth while typing, and the preview updates only after 400ms of
        inactivity. As a result, expensive rendering work is performed less
        frequently, improving overall performance.
        <br />
        <br />
        Render count: <strong>{renderCount.current}</strong>
      </p>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function UseDebounceDemo() {
  return (
    <div className="demo">
      <SearchCallCountDemo />
      <LivePreviewDemo />
    </div>
  );
}
