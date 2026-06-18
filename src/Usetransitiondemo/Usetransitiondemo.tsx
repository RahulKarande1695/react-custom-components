/**
 * useTransition — 2 real-world patterns
 *
 * useTransition marks a state update as "non-urgent" — React can pause it
 * to keep urgent updates (typing, clicking) responsive.
 *
 *   const [isPending, startTransition] = useTransition();
 *   startTransition(() => setExpensiveState(value));
 *
 * Urgent vs Non-urgent updates:
 * - Urgent    — typing in input, clicking a button → must feel instant
 * - Non-urgent — filtering 5000 items, switching heavy tabs → can be slightly delayed
 *
 * Key benefit: input stays responsive even while expensive re-render happens.
 * isPending lets you show a loading indicator during the transition.
 *
 * Pattern 1 — Heavy list filter   : input stays smooth while list re-renders
 * Pattern 2 — Tab switch          : tab click responsive, content loads with isPending
 */

import { useState, useTransition, useRef } from "react";
import type { ChangeEvent } from "react";
import "./UseTransitionDemo.css";

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 1 — Heavy list filter
// ═══════════════════════════════════════════════════════════════════════════════

// 8000 items — filtering this on every keystroke without transition = laggy input
const BIG_LIST = Array.from({ length: 8000 }, (_, i) => `Item ${i + 1} — Product SKU-${1000 + i}`);

// Simulates expensive render work per item (artificial slowdown for demo)
function expensiveFilter(query: string): string[] {
  const result = BIG_LIST.filter((item) => item.toLowerCase().includes(query.toLowerCase()));
  // Simulate heavy computation per result (forces visible lag without transition)
  let dummy = 0;
  for (let i = 0; i < result.length * 200; i++) dummy += i;
  return result.slice(0, 30);
}

function HeavyFilterDemo() {
  const [query, setQuery]       = useState("");
  const [results, setResults]   = useState<string[]>(() => expensiveFilter(""));
  const [isPending, startTransition] = useTransition();

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    // Urgent — input value updates immediately, stays responsive
    setQuery(value);

    // Non-urgent — heavy filter wrapped in transition, can be interrupted
    startTransition(() => {
      setResults(expensiveFilter(value));
    });
  }

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 1</p>
      <p className="demo__title">Heavy list filter — 8000 items, input stays smooth</p>

      <div style={{ position: "relative" }}>
        <input
          className="field-input"
          value={query}
          onChange={handleChange}
          placeholder="Type to filter 8000 items..."
        />
        {isPending && (
          <span style={{ position: "absolute", right: 10, top: 10 }}>
            <span className="spinner" />
          </span>
        )}
      </div>

      <div className={`tab-panel${isPending ? " tab-panel--pending" : ""}`}>
        <div className="item-list">
          {results.length === 0 ? (
            <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>No matches</p>
          ) : (
            results.map((item) => <div key={item} className="item-row">{item}</div>)
          )}
        </div>
      </div>

      <p className="demo__note">
        <code>setQuery(value)</code> — urgent, input lगेच update होतो.
        <code>startTransition(() =&gt; setResults(...))</code> — non-urgent, React ला priority कमी देतो.
        टाईप करताना input lag होत नाही, फक्त list थोडी delay ने update होते (<code>isPending</code> spinner सोबत).
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 2 — Tab switch with heavy content
// ═══════════════════════════════════════════════════════════════════════════════

type TabKey = "overview" | "analytics" | "reports";

// Simulates heavy tab content computation
function computeTabData(tab: TabKey): { title: string; rows: string[] } {
  const count = tab === "analytics" ? 3000 : tab === "reports" ? 2000 : 500;
  // Artificial heavy work — simulates expensive chart/table render
  let dummy = 0;
  for (let i = 0; i < count * 300; i++) dummy += i;

  const rows = Array.from({ length: 8 }, (_, i) => `${tab} row ${i + 1} — value ${Math.round(Math.random() * 1000)}`);
  return { title: tab.charAt(0).toUpperCase() + tab.slice(1), rows };
}

function TabSwitchDemo() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [data, setData]           = useState(() => computeTabData("overview"));
  const [isPending, startTransition] = useTransition();
  const clickedTabRef = useRef<TabKey>("overview");

  function handleTabClick(tab: TabKey) {
    clickedTabRef.current = tab;
    // Tab highlight updates immediately (urgent)
    // Heavy content computation deferred (non-urgent)
    startTransition(() => {
      setActiveTab(tab);
      setData(computeTabData(tab));
    });
  }

  const tabs: TabKey[] = ["overview", "analytics", "reports"];

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 2</p>
      <p className="demo__title">Tab switch — responsive click, deferred heavy content</p>

      <div className="tab-bar">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`tab-btn${activeTab === tab ? " tab-btn--active" : ""}`}
            onClick={() => handleTabClick(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {isPending && clickedTabRef.current === tab && (
              <span className="spinner" style={{ marginLeft: 6, verticalAlign: "middle" }} />
            )}
          </button>
        ))}
      </div>

      <div className={`tab-panel${isPending ? " tab-panel--pending" : ""}`}>
        <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 8px", color: "#111827" }}>
          {data.title} {isPending && <span className="badge badge--pending">Loading...</span>}
        </p>
        <div className="item-list">
          {data.rows.map((row, i) => <div key={i} className="item-row">{row}</div>)}
        </div>
      </div>

      <p className="demo__note">
        Tab button click लगेच highlight होतो (visual feedback instant).
        Heavy content (<code>computeTabData</code>) background मध्ये compute होतो —
        <code>isPending</code> true असताना old content थोडा faded दिसतो, नवीन तयार झाल्यावर swap होतो.
      </p>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function UseTransitionDemo() {
  return (
    <div className="demo">
      <HeavyFilterDemo />
      <TabSwitchDemo />
    </div>
  );
}