/**
 * useId — 2 real-world patterns
 *
 * useId generates a unique, stable ID string — same across server and
 * client renders (SSR-safe). Solves the htmlFor/id mismatch problem.
 *
 *   const id = useId();
 *   <label htmlFor={id}>Name</label>
 *   <input id={id} />
 *
 * Why NOT use Math.random() or a counter for ids:
 * - Math.random() — different value on server vs client → SSR hydration mismatch
 * - Counter (let id = 0; id++) — order can differ between server/client renders
 * - useId — React guarantees same id on server and client
 *
 * When to use:
 * - Linking label + input (htmlFor / id)
 * - aria-describedby, aria-labelledby for accessibility
 * - Multiple instances of same component — each gets unique, non-colliding ids
 *
 * When NOT to use:
 * - List keys — use stable data id (item.id), NOT useId
 * - As a value that changes — useId only generates fixed ids, not state
 *
 * Pattern 1 — Accessible form field   : label + input + hint, all linked
 * Pattern 2 — Multiple component instances : same component twice, no id collision
 */

import { useId, useState } from "react";
import "./UseIdDemo.css";

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 1 — Accessible form field (label + input + hint + error)
// ═══════════════════════════════════════════════════════════════════════════════

function AccessibleField({ label, hint }: { label: string; hint: string }) {
  // One useId call, multiple related ids derived from it via suffix
  const id = useId();
  const [value, setValue] = useState("");

  return (
    <div className="form-row">
      <label className="form-row__label" htmlFor={id}>{label}</label>
      <input
        id={id}
        className="form-row__input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-describedby={`${id}-hint`}
      />
      <p id={`${id}-hint`} className="form-row__hint">{hint}</p>
      <span className="id-display">id: {id}</span>
    </div>
  );
}

function AccessibleFieldDemo() {
  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 1</p>
      <p className="demo__title">Accessible form field — label + input + hint linked</p>

      <AccessibleField label="Full name"  hint="As per your ID proof." />
      <AccessibleField label="Email"      hint="We'll send confirmation here." />

      <p className="demo__note">
        <code>useId()</code> — एकच unique id, त्यावरून <code>{`${"id"}-hint`}</code> सारखे
        related ids derive करतो. <code>htmlFor</code> = input <code>id</code> — label click
        केल्यावर input focus होतो, screen reader ला पण field कळतो.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 2 — Multiple instances, no collision
// ═══════════════════════════════════════════════════════════════════════════════

// Reusable Toggle component — used multiple times on same page
function ToggleField({ label }: { label: string }) {
  const id = useId();
  const [checked, setChecked] = useState(false);

  return (
    <div className="checkbox-row">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
      />
      <label htmlFor={id}>{label}</label>
      <span className="id-display">{id}</span>
    </div>
  );
}

function MultipleInstancesDemo() {
  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 2</p>
      <p className="demo__title">Multiple instances — same component, unique ids</p>

      <div className="instance-box">
        <p className="instance-box__title">Notification Settings</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <ToggleField label="Email notifications" />
          <ToggleField label="SMS notifications" />
          <ToggleField label="Push notifications" />
        </div>
      </div>

      <div className="compare">
        <div className="compare__cell compare__cell--header">Hardcoded id="toggle"</div>
        <div className="compare__cell compare__cell--header">useId()</div>
        <div className="compare__cell compare__cell--bad">
          All 3 instances get same id → label clicks wrong input
        </div>
        <div className="compare__cell compare__cell--good">
          Each instance gets unique id automatically ✓
        </div>
      </div>

      <p className="demo__note">
        <code>ToggleField</code> 3 वेळा वापरला — प्रत्येकाला वेगळा <code>useId()</code> मिळाला.
        Hardcoded <code>id="toggle"</code> वापरलं असतं तर सगळे एकाच id share करत असते —
        invalid HTML आणि label click चुकीच्या input ला जातो.
      </p>

      <p className="demo__warning">
        ⚠️ <strong>List keys साठी useId वापरू नकोस</strong> — keys साठी data चा stable
        id (<code>item.id</code>) वापर. useId फक्त same component render दरम्यान स्थिर असतो,
        list reorder झाली तर key म्हणून चुकीचा वापर bugs देतो.
      </p>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function UseIdDemo() {
  return (
    <div className="demo">
      <AccessibleFieldDemo />
      <MultipleInstancesDemo />
    </div>
  );
}