/**
 * useCallback — 3 real-world patterns + comparison with useMemo
 *
 * useCallback caches a function reference between renders.
 * Returns the same function instance unless dependencies change.
 *
 *   const fn = useCallback(() => doSomething(a), [a]);
 *
 * useCallback vs useMemo:
 *   useMemo    → caches the RESULT of a function   → useMemo(() => calc(), [dep])
 *   useCallback → caches the FUNCTION itself        → useCallback(() => fn(), [dep])
 *   useCallback(fn, deps) === useMemo(() => fn, deps)
 *
 * When TO use:
 * 1. Function passed to React.memo child — prevents child re-render
 * 2. Function in useEffect dependency array — prevents infinite loop
 * 3. Expensive event handlers in lists — stable reference
 *
 * Pattern 1 — React.memo + useCallback : prevent child re-renders
 * Pattern 2 — useEffect dependency     : stable fetch function
 * Pattern 3 — List handlers            : stable callbacks in mapped items
 */

import { useState, useCallback, useEffect, useRef, memo } from "react";
import type { ChangeEvent } from "react";
import "./UseCallbackDemo.css";

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 1 — React.memo + useCallback
// ═══════════════════════════════════════════════════════════════════════════════

// React.memo — skips re-render if props are the same reference
const ChildWithout = memo(function ChildWithout({ onClick }: { onClick: () => void }) {
  const renders = useRef(0);
  renders.current += 1;
  return (
    <div className="child-box child-box--without">
      ✗ Without useCallback — renders: {renders.current}
      <button style={{ marginLeft: 8 }} onClick={onClick}>Click</button>
    </div>
  );
});

const ChildWith = memo(function ChildWith({ onClick }: { onClick: () => void }) {
  const renders = useRef(0);
  renders.current += 1;
  return (
    <div className="child-box child-box--with">
      ✓ With useCallback — renders: {renders.current}
      <button style={{ marginLeft: 8 }} onClick={onClick}>Click</button>
    </div>
  );
});

function ReactMemoDemo() {
  const [count, setCount] = useState(0);
  const [unrelated, setUnrelated] = useState(0);
  const parentRenders = useRef(0);
  parentRenders.current += 1;

  // WITHOUT useCallback — new function every render → React.memo useless
  const handleWithout = () => console.log("without", count);

  // WITH useCallback — same reference unless count changes → React.memo works
  const handleWith = useCallback(() => {
    console.log("with", count);
  }, [count]);

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 1</p>
      <p className="demo__title">React.memo + useCallback — prevent child re-renders</p>

      <div className="render-tracker">
        <span className="render-chip render-chip--parent">Parent renders: {parentRenders.current}</span>
      </div>

      <div className="compare">
        <div className="compare__cell compare__cell--header">Without useCallback</div>
        <div className="compare__cell compare__cell--header">With useCallback</div>
        <div className="compare__cell compare__cell--bad">
          New function ref every render → React.memo always re-renders child
        </div>
        <div className="compare__cell compare__cell--good">
          Same function ref → React.memo skips child re-render ✓
        </div>
      </div>

      <ChildWithout onClick={handleWithout} />
      <ChildWith    onClick={handleWith} />

      <div className="btn-row">
        <button className="btn btn--primary" onClick={() => setCount((p) => p + 1)}>
          Change count ({count})
        </button>
        <button className="btn btn--ghost" onClick={() => setUnrelated((p) => p + 1)}>
          Unrelated render ({unrelated})
        </button>
      </div>

      <p className="demo__note">
        "Unrelated render" — parent re-renders, count नाही बदलत.
        ChildWith render count वाढत नाही — handleWith same reference.
        ChildWithout render count वाढतो — handleWithout नेहमी नवीन function.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 2 — Stable function in useEffect dep
// ═══════════════════════════════════════════════════════════════════════════════

function UseEffectDepDemo() {
  const [userId, setUserId]     = useState(1);
  const [data, setData]         = useState<string | null>(null);
  const [fetchCount, setFetchCount] = useState(0);
  const [theme, setTheme]       = useState("light");

  // WITHOUT useCallback — fetchUser is new every render
  // If added to useEffect deps: infinite loop (fetch → render → new fn → fetch...)
  // const fetchUser = async () => { ... }; // ← DON'T add to useEffect deps

  // WITH useCallback — stable reference, safe to add to useEffect deps
  const fetchUser = useCallback(async () => {
    setData(`Fetching user ${userId}...`);
    await new Promise((r) => setTimeout(r, 400));
    setData(`User ${userId}: rahul${userId}@example.com`);
    setFetchCount((p) => p + 1);
  }, [userId]); // only changes when userId changes

  useEffect(() => {
    fetchUser();
  }, [fetchUser]); // safe — fetchUser is stable unless userId changes

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 2</p>
      <p className="demo__title">Stable function in useEffect dep — no infinite loop</p>

      <div className="btn-row">
        {[1, 2, 3].map((id) => (
          <button
            key={id}
            className={`btn ${userId === id ? "btn--primary" : "btn--ghost"}`}
            onClick={() => setUserId(id)}
          >
            User {id}
          </button>
        ))}
        <button className="btn btn--ghost" onClick={() => setTheme((t) => t === "light" ? "dark" : "light")}>
          Theme ({theme})
        </button>
      </div>

      <div style={{ padding: "8px 12px", background: "#f9fafb", borderRadius: 8, fontSize: 13, color: "#374151" }}>
        {data ?? "Loading..."}
      </div>

      <span className="render-chip render-chip--with" style={{ alignSelf: "flex-start", padding: "4px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600, background: "#f0fdf4", color: "#15803d" }}>
        Fetch count: {fetchCount} — only on user change ✓
      </span>

      <p className="demo__note">
        Theme toggle — fetchCount नाही वाढत. <code>fetchUser</code> useCallback मध्ये
        आहे, theme change वर new reference नाही → useEffect fire नाही.
        Without useCallback: fetchUser नेहमी नवीन → useEffect हर render fire → infinite loop.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 3 — Stable handlers in list
// ═══════════════════════════════════════════════════════════════════════════════

interface Tag { id: string; label: string; }

function ListHandlerDemo() {
  const [tags, setTags]   = useState<Tag[]>([
    { id: "1", label: "React" },
    { id: "2", label: "TypeScript" },
    { id: "3", label: "Redux" },
    { id: "4", label: "MUI" },
  ]);
  const [input, setInput] = useState("");

  // Stable remove handler — doesn't change on unrelated re-renders
  const handleRemove = useCallback((id: string) => {
    setTags((prev) => prev.filter((t) => t.id !== id));
  }, []); // [] — setTags is stable (React guarantees setter stability)

  const handleAdd = useCallback(() => {
    const label = input.trim();
    if (!label || tags.some((t) => t.label === label)) return;
    setTags((prev) => [...prev, { id: Date.now().toString(), label }]);
    setInput("");
  }, [input, tags]);

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 3</p>
      <p className="demo__title">Stable handlers in list — useCallback + React.memo</p>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          className="field-input"
          value={input}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
          placeholder="Add tag..."
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <button className="btn btn--primary" onClick={handleAdd} disabled={!input.trim()}>
          Add
        </button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {tags.map((tag) => (
          <span key={tag.id} className="tag">
            {tag.label}
            <button
              className="tag__remove"
              onClick={() => handleRemove(tag.id)}
              aria-label={`Remove ${tag.label}`}
            >
              ✕
            </button>
          </span>
        ))}
      </div>

      <p className="demo__note">
        <code>handleRemove</code> — <code>[]</code> deps, setTags functional update वापरतो.
        React guarantees <code>setState</code> setters are stable — त्यामुळे deps मध्ये नको.
        प्रत्येक tag साठी same <code>handleRemove</code> reference जातो.
      </p>

      <p className="demo__warning">
        ⚠️ <strong>useMemo vs useCallback:</strong>{" "}
        <code>useCallback(fn, deps)</code> === <code>useMemo(() =&gt; fn, deps)</code>.
        Function cache करायला useCallback, value cache करायला useMemo — बस.
      </p>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function UseCallbackDemo() {
  return (
    <div className="demo">
      <ReactMemoDemo />
      <UseEffectDepDemo />
      <ListHandlerDemo />
    </div>
  );
}