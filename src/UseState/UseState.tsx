/**
 * useState — 4 real-world usage patterns
 *
 * 1. Primitive state    — counter (number)
 * 2. Boolean state      — toggle (boolean)
 * 3. Object state       — form fields (object) — spread operator for immutability
 * 4. Array state        — tags (array) — map/filter for immutability
 * 5. Lazy initializer   — expensive initial value via function
 *
 * Key rules shown here:
 * - State is immutable — always return new value, never mutate directly
 * - Functional update: `setCount(prev => prev + 1)` — safe when new state
 *   depends on old state (avoids stale closure bugs)
 * - Object state: spread `{ ...prev, key: value }` — partial update
 * - Array state: map/filter — never push/splice directly
 * - Lazy init: `useState(() => compute())` — runs only once on mount
 */

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import "./UseStateDemo.css";

// ─── 1. Primitive state — Counter ─────────────────────────────────────────────

function CounterDemo() {
  // Primitive number state
  const [count, setCount] = useState(0);

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 1</p>
      <p className="demo__title">Primitive state — number</p>

      <div className="counter">
        {/* Functional update — prev guarantees latest value, avoids stale closure */}
        <button className="counter__btn" onClick={() => setCount((prev) => prev - 1)}>−</button>
        <span className="counter__value">{count}</span>
        <button className="counter__btn" onClick={() => setCount((prev) => prev + 1)}>+</button>
        <button className="counter__reset" onClick={() => setCount(0)}>Reset</button>
      </div>

      <p className="demo__note">
        <code>setCount(prev =&gt; prev + 1)</code> — functional update.
        Safer than <code>setCount(count + 1)</code> when update depends on previous value.
      </p>
    </div>
  );
}

// ─── 2. Boolean state — Toggle ────────────────────────────────────────────────

function ToggleDemo() {
  const [isOn, setIsOn] = useState(false);

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 2</p>
      <p className="demo__title">Boolean state — toggle</p>

      <div className="toggle-box">
        <span className={`toggle-box__status toggle-box__status--${isOn ? "on" : "off"}`}>
          {isOn ? "ON" : "OFF"}
        </span>
        {/* prev => !prev — always flips correctly even in batched updates */}
        <button className="toggle-box__btn" onClick={() => setIsOn((prev) => !prev)}>
          Toggle
        </button>
      </div>

      <p className="demo__note">
        <code>setIsOn(prev =&gt; !prev)</code> — never use <code>setIsOn(!isOn)</code>
        inside async callbacks, it may read stale value.
      </p>
    </div>
  );
}

// ─── 3. Object state — Form ───────────────────────────────────────────────────

interface FormState {
  name: string;
  email: string;
}

function ObjectStateDemo() {
  const [form, setForm] = useState<FormState>({ name: "", email: "" });

  // Partial update — spread existing state, override only changed key
  // Without spread, other fields would be lost
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 3</p>
      <p className="demo__title">Object state — form fields</p>

      <div className="form-row">
        <label className="form-row__label" htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          className="form-row__input"
          value={form.name}
          onChange={handleChange}
          placeholder="Rahul"
        />
      </div>
      <div className="form-row">
        <label className="form-row__label" htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          className="form-row__input"
          value={form.email}
          onChange={handleChange}
          placeholder="rahul@example.com"
        />
      </div>

      <div className="form-output">
        {form.name || form.email
          ? `${form.name} — ${form.email}`
          : "Type above to see state..."}
      </div>

      <p className="demo__note">
        <code>{"{ ...prev, [name]: value }"}</code> — spread preserves other fields.
        Without spread, <code>{"setForm({ name: value })"}</code> would drop email.
      </p>
    </div>
  );
}

// ─── 4. Array state — Tags ───────────────────────────────────────────────────

function ArrayStateDemo() {
  const [tags, setTags]   = useState<string[]>(["React", "TypeScript"]);
  const [input, setInput] = useState("");

  function addTag(e: FormEvent) {
    e.preventDefault();
    const tag = input.trim();
    if (!tag || tags.includes(tag)) return;
    // Never push — always return new array
    setTags((prev) => [...prev, tag]);
    setInput("");
  }

  function removeTag(tag: string) {
    // filter returns new array — original untouched
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 4</p>
      <p className="demo__title">Array state — tags</p>

      <form className="tag-input-row" onSubmit={addTag} noValidate>
        <input
          className="tag-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add tag..."
          aria-label="New tag"
        />
        <button
          type="submit"
          className="tag-add-btn"
          disabled={!input.trim() || tags.includes(input.trim())}
        >
          Add
        </button>
      </form>

      <div className="tag-list">
        {tags.map((tag) => (
          <span key={tag} className="tag">
            {tag}
            <button
              type="button"
              className="tag__remove"
              aria-label={`Remove ${tag}`}
              onClick={() => removeTag(tag)}
            >
              ✕
            </button>
          </span>
        ))}
      </div>

      <p className="demo__note">
        Add: <code>{"[...prev, newItem]"}</code> — never <code>prev.push()</code>.
        Remove: <code>{"prev.filter(t => t !== tag)"}</code> — never <code>splice()</code>.
        React needs a new array reference to detect change.
      </p>
    </div>
  );
}

// ─── 5. Lazy initializer ──────────────────────────────────────────────────────

// Simulates expensive computation (e.g. parsing localStorage, heavy calc)
function computeExpensiveValue(): number {
  console.log("Runs only once on mount — not on every re-render");
  return Number(localStorage.getItem("savedCount") ?? 42);
}

function LazyInitDemo() {
  // Pass function reference — useState calls it only on first render
  // If you write useState(computeExpensiveValue()) — runs on EVERY render
  const [value, setValue] = useState(computeExpensiveValue);

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 5</p>
      <p className="demo__title">Lazy initializer — expensive initial value</p>

      <div className="lazy-box">
        <span className="lazy-box__value">{value}</span>
        <button
          className="lazy-box__btn"
          onClick={() => {
            const next = value + 1;
            setValue(next);
            localStorage.setItem("savedCount", String(next));
          }}
        >
          Increment + Save
        </button>
      </div>

      <p className="demo__note">
        <code>useState(computeExpensiveValue)</code> — pass function reference,
        not <code>useState(computeExpensiveValue())</code>.
        Parentheses means it runs every render — without means only once on mount.
      </p>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function UseState() {
  return (
    <div className="demo">
      <CounterDemo />
      <ToggleDemo />
      <ObjectStateDemo />
      <ArrayStateDemo />
      <LazyInitDemo />
    </div>
  );
}