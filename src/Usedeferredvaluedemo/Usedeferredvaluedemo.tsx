/**
 * useDeferredValue — 2 real-world patterns + comparison with useTransition
 *
 * useDeferredValue gives you a "lagging" copy of a value — it updates
 * AFTER the urgent render is done, letting React keep input responsive.
 *
 *   const deferredValue = useDeferredValue(value);
 *
 * useTransition vs useDeferredValue:
 * ┌──────────────────────┬─────────────────────┬─────────────────────┐
 * │                       │   useTransition      │  useDeferredValue   │
 * ├──────────────────────┼─────────────────────┼─────────────────────┤
 * │ Controls              │ A state SETTER call │ A VALUE itself      │
 * │ Use when               │ You own the setState│ You receive a prop/ │
 * │                        │ call                │ value you can't wrap │
 * │ Example                │ Tab switching       │ Filtering from props │
 * └──────────────────────┴─────────────────────┴─────────────────────┘
 *
 * Rule of thumb: if you call setState yourself → useTransition.
 *                if you just receive a value (prop, search term) → useDeferredValue.
 *
 * Pattern 1 — Search with deferred results : compare immediate vs deferred render
 * Pattern 2 — Stale indicator               : visually show when content is outdated
 */

import { useState, useDeferredValue, useMemo } from "react";
import type { ChangeEvent } from "react";
import "./UseDeferredValueDemo.css";

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 1 — Search with deferred value
// ═══════════════════════════════════════════════════════════════════════════════

const BIG_LIST = Array.from(
  { length: 6000 },
  (_, i) => `Result ${i + 1} — keyword-${1000 + i}`,
);

function expensiveSearch(query: string): string[] {
  const result = BIG_LIST.filter((item) =>
    item.toLowerCase().includes(query.toLowerCase()),
  );
  // Simulate heavy render cost
  let dummy = 0;
  for (let i = 0; i < result.length * 150; i++) dummy += i;
  return result.slice(0, 30);
}

function SearchDemo() {
  const [query, setQuery] = useState("");

  // deferredQuery "lags behind" query during heavy renders
  // Input (query) updates instantly; list (deferredQuery) catches up after
  const deferredQuery = useDeferredValue(query);

  // isStale — true while deferredQuery hasn't caught up to query yet
  const isStale = query !== deferredQuery;

  // useMemo prevents recalculating on every render — only when deferredQuery changes
  const results = useMemo(
    () => expensiveSearch(deferredQuery),
    [deferredQuery],
  );

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 1</p>
      <p className="demo__title">Search with deferred value — 6000 items</p>

      <input
        className="field-input"
        value={query}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setQuery(e.target.value)
        }
        placeholder="Type to search..."
      />

      <div className={`tab-panel${isStale ? " tab-panel--stale" : ""}`}>
        <div className="item-list">
          {results.length === 0 ? (
            <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>
              No matches
            </p>
          ) : (
            results.map((item) => (
              <div key={item} className="item-row">
                {item}
              </div>
            ))
          )}
        </div>
      </div>

      <span className={`badge ${isStale ? "badge--stale" : "badge--fresh"}`}>
        {isStale ? "⏳ Updating..." : "✓ Up to date"}
      </span>

      <p className="demo__note">
        <code>query</code> represents the current input value and updates
        immediately with every keystroke. <code>deferredQuery</code> contains
        the same value, but updates with a slight delay, allowing React to
        prioritize more urgent UI updates. The expression{" "}
        <code>isStale = query !== deferredQuery</code> indicates that the list
        is still rendering results for the previous query while React prepares
        the updated results in the background.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 2 — Stale content fade (visual feedback)
// ═══════════════════════════════════════════════════════════════════════════════

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
}

const PRODUCTS: Product[] = Array.from({ length: 4000 }, (_, i) => ({
  id: i,
  name: `Product ${i + 1}`,
  category: ["Electronics", "Clothing", "Books"][i % 3],
  price: 100 + (i % 50) * 50,
}));

function filterProducts(query: string): Product[] {
  const result = PRODUCTS.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()),
  );
  let dummy = 0;
  for (let i = 0; i < result.length * 150; i++) dummy += i;
  return result.slice(0, 25);
}

// Wrapped in memo conceptually — receives deferred value as prop
function ProductGrid({ query }: { query: string }) {
  const results = useMemo(() => filterProducts(query), [query]);
  return (
    <div className="item-list">
      {results.map((p) => (
        <div key={p.id} className="item-row">
          {p.name} <span style={{ color: "#9ca3af" }}>({p.category})</span> — ₹
          {p.price}
        </div>
      ))}
    </div>
  );
}

function StaleIndicatorDemo() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 2</p>
      <p className="demo__title">
        Stale content fade — visual feedback during transition
      </p>

      <input
        className="field-input"
        value={query}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setQuery(e.target.value)
        }
        placeholder="Search 4000 products..."
      />

      {/* Opacity fades while stale — user sees old results dimmed, not frozen UI */}
      <div
        className="tab-panel"
        style={{ opacity: isStale ? 0.5 : 1, transition: "opacity 0.2s" }}
      >
        <ProductGrid query={deferredQuery} />
      </div>

      <div className="compare">
        <div className="compare__cell compare__cell--header">
          Without useDeferredValue
        </div>
        <div className="compare__cell compare__cell--header">
          With useDeferredValue
        </div>
        <div className="compare__cell compare__cell--bad">
          Typing lags — every keystroke blocked by heavy render
        </div>
        <div className="compare__cell compare__cell--good">
          Typing stays smooth — list fades and catches up
        </div>
      </div>
      <p className="demo__note">
        <code>ProductGrid</code> receives <code>deferredQuery</code> as a
        regular prop, so the component has no knowledge that the value is
        deferred. It simply renders using the value it receives. This makes{" "}
        <code>useDeferredValue</code>
        especially useful for prop-driven components, such as third-party
        components or components that receive data from a parent, where you do
        not directly control state updates with <code>setState</code>.
      </p>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function UseDeferredValueDemo() {
  return (
    <div className="demo">
      <SearchDemo />
      <StaleIndicatorDemo />
    </div>
  );
}
