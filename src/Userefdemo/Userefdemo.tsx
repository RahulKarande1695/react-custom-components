/**
 * useRef — 4 real-world patterns + comparison with useState
 *
 * useRef returns { current: value } — mutable object that:
 * - Persists across renders (like state)
 * - Does NOT trigger re-render when changed (unlike state)
 *
 * Two main use cases:
 * 1. DOM access     — ref.current points to a DOM element
 * 2. Mutable value  — store value without causing re-render
 *
 * Key comparison: useRef vs useState
 * ┌─────────────────────┬──────────────┬──────────────┐
 * │                     │   useRef     │  useState    │
 * ├─────────────────────┼──────────────┼──────────────┤
 * │ Triggers re-render  │     No       │     Yes      │
 * │ Persists on render  │     Yes      │     Yes      │
 * │ Mutable             │     Yes      │  Via setter  │
 * │ DOM access          │     Yes      │     No       │
 * └─────────────────────┴──────────────┴──────────────┘
 *
 * Pattern 1 — DOM access       : focus input programmatically
 * Pattern 2 — No re-render     : render count vs state count (comparison)
 * Pattern 3 — Previous value   : track previous state value
 * Pattern 4 — Interval/timeout : store timer id without re-render
 */

import { useState, useRef, useEffect } from "react";
import "./UseRefDemo.css";

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 1 — DOM access: focus, scroll, play/pause
// ═══════════════════════════════════════════════════════════════════════════════

function DomAccessDemo() {
  const inputRef  = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 1</p>
      <p className="demo__title">DOM access — focus, scroll</p>

      <input
        ref={inputRef}
        className="field-input"
        placeholder="Click button to focus me..."
      />

      <div className="btn-row">
        {/* Direct DOM imperative action — not possible with state */}
        <button
          className="btn btn--primary"
          onClick={() => inputRef.current?.focus()}
        >
          Focus input
        </button>
        <button
          className="btn btn--ghost"
          onClick={() => {
            inputRef.current?.select(); // select all text
          }}
        >
          Select all
        </button>
        <button
          className="btn btn--ghost"
          onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
        >
          Scroll to ref
        </button>
      </div>

      <p className="demo__note">
        <code>ref.current.focus()</code> — imperative DOM action.
        State ने हे करता येत नाही — React declarative आहे, DOM directly control नाही करत.
      </p>

      <div ref={bottomRef} style={{ height: 1 }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 2 — No re-render: ref vs state comparison
// ═══════════════════════════════════════════════════════════════════════════════

function RenderCountDemo() {
  // useRef — changes don't trigger re-render
  const refCount   = useRef(0);
  // useState — every change triggers re-render
  const [stateCount, setStateCount] = useState(0);
  // Track actual render count
  const renderCount = useRef(0);
  renderCount.current += 1;

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 2</p>
      <p className="demo__title">No re-render — ref vs state comparison</p>

      <div className="compare">
        <div className="compare__cell compare__cell--header">useRef</div>
        <div className="compare__cell compare__cell--header">useState</div>
        <div className="compare__cell compare__cell--good">
          No re-render when changed ✓
        </div>
        <div className="compare__cell compare__cell--bad">
          Re-renders on every change ✗
        </div>
        <div className="compare__cell compare__cell--good">
          Good for: timers, previous value, DOM refs
        </div>
        <div className="compare__cell compare__cell--bad">
          Expensive if used for non-UI values
        </div>
      </div>

      <div className="btn-row">
        <button
          className="btn btn--ghost"
          onClick={() => {
            refCount.current += 1;
            // No re-render — UI won't update until something else renders
            console.log("ref value:", refCount.current);
          }}
        >
          Increment ref ({refCount.current})
        </button>
        <button
          className="btn btn--primary"
          onClick={() => setStateCount((p) => p + 1)}
        >
          Increment state ({stateCount})
        </button>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <span className="render-badge render-badge--ref">
          Ref value: {refCount.current}
        </span>
        <span className="render-badge render-badge--state">
          Renders: {renderCount.current}
        </span>
      </div>

      <p className="demo__note">
        ref increment करताना render होत नाही — ref value UI मध्ये stale दिसतो.
        state increment केल्यावर re-render होतो — तेव्हा ref चा latest value पण दिसतो.
        Interviewer tip: <code>renderCount</code> track करायला ref वापरतात, state नाही.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 3 — Previous value tracking
// ═══════════════════════════════════════════════════════════════════════════════

function usePrevious<T>(value: T): T | undefined {
  const prevRef = useRef<T | undefined>(undefined);

  useEffect(() => {
    // After render: store current value as previous for NEXT render
    prevRef.current = value;
  });

  return prevRef.current; // returns value from BEFORE this render
}

function PreviousValueDemo() {
  const [count, setCount] = useState(0);
  const prevCount         = usePrevious(count);

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 3</p>
      <p className="demo__title">Previous value — custom usePrevious hook</p>

      <div className="prev-row">
        <span className="prev-row__label">Previous</span>
        <span className="prev-row__value">{prevCount ?? "—"}</span>
      </div>
      <div className="prev-row">
        <span className="prev-row__label">Current</span>
        <span className="prev-row__value" style={{ color: "#6366f1" }}>{count}</span>
      </div>

      <div className="btn-row">
        <button className="btn btn--ghost"  onClick={() => setCount((p) => p - 1)}>−</button>
        <button className="btn btn--primary" onClick={() => setCount((p) => p + 1)}>+</button>
      </div>

      <p className="demo__note">
        <code>prevRef.current</code> — useEffect मध्ये render नंतर update होतो.
        त्यामुळे render दरम्यान <code>prevRef.current</code> मागच्या render चा value असतो.
        Real-world: animation direction, undo, change detection साठी वापरतात.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 4 — Store timer id (no re-render needed)
// ═══════════════════════════════════════════════════════════════════════════════

function TimerRefDemo() {
  const [display, setDisplay] = useState("Stopped");
  const [running, setRunning] = useState(false);
  // Store interval id in ref — changing it shouldn't re-render
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const secondsRef  = useRef(0);

  function start() {
    if (intervalRef.current) return; // already running
    setRunning(true);
    intervalRef.current = setInterval(() => {
      secondsRef.current += 1;
      setDisplay(`Running: ${secondsRef.current}s`);
    }, 1000);
  }

  function stop() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
    setDisplay(`Stopped at ${secondsRef.current}s`);
  }

  function reset() {
    stop();
    secondsRef.current = 0;
    setDisplay("Stopped");
  }

  // Cleanup on unmount
  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 4</p>
      <p className="demo__title">Timer id in ref — no unnecessary re-renders</p>

      <p style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "#111827" }}>
        {display}
      </p>

      <div className="btn-row">
        <button className="btn btn--primary" onClick={start} disabled={running}>Start</button>
        <button className="btn btn--ghost"   onClick={stop}  disabled={!running}>Stop</button>
        <button className="btn btn--ghost"   onClick={reset}>Reset</button>
      </div>

      <p className="demo__note">
        <code>intervalRef.current</code> — interval id store करतो.
        useState मध्ये id ठेवलं तर setInterval call होताना re-render होतो — unnecessary.
        Ref मध्ये ठेवल्याने re-render नाही, पण id persist राहतो → cleanup साठी available.
      </p>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function UseRefDemo() {
  return (
    <div className="demo">
      <DomAccessDemo />
      <RenderCountDemo />
      <PreviousValueDemo />
      <TimerRefDemo />
    </div>
  );
}