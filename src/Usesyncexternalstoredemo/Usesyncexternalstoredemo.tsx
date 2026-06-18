/**
 * useSyncExternalStore — 3 real-world patterns
 *
 * Subscribes a React component to an external (non-React) data source —
 * browser APIs, third-party stores (Redux, Zustand), or any mutable state
 * that lives OUTSIDE React.
 *
 *   const value = useSyncExternalStore(subscribe, getSnapshot);
 *
 *   subscribe(callback)  — register callback, return unsubscribe fn
 *   getSnapshot()        — return current value (must be referentially stable
 *                           if unchanged, or component re-renders infinitely)
 *
 * Why not just useEffect + useState for this?
 * - useSyncExternalStore avoids "tearing" in concurrent rendering —
 *   guarantees all components see the same snapshot during a single render,
 *   even with external store updates happening mid-render.
 * - This is what Redux, Zustand, Jotai use internally for their React bindings.
 *
 * Pattern 1 — Browser API (online/offline)  : navigator.onLine
 * Pattern 2 — Window size                    : window.innerWidth/innerHeight
 * Pattern 3 — Custom external store           : tiny Redux-like store from scratch
 */

import { useSyncExternalStore } from "react";
import "./UseSyncExternalStoreDemo.css";

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 1 — Browser API: online/offline status
// ═══════════════════════════════════════════════════════════════════════════════

// subscribe — browser's online/offline events are the "external store"
function subscribeOnlineStatus(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getOnlineSnapshot(): boolean {
  return navigator.onLine;
}

function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribeOnlineStatus, getOnlineSnapshot);
}

function OnlineStatusDemo() {
  const isOnline = useOnlineStatus();

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 1</p>
      <p className="demo__title">Browser API — navigator.onLine</p>

      <span className={`status-badge status-badge--${isOnline ? "online" : "offline"}`}>
        <span className={`status-dot ${isOnline ? "status-dot--online" : ""}`} />
        {isOnline ? "Online" : "Offline"}
      </span>

      <p className="demo__note">
        <code>navigator.onLine</code> — browser चं external state, React च्या बाहेर.
        WiFi बंद/चालू करून try कर — component automatically sync होतो,
        कोणताही manual useEffect listener लिहायची गरज नाही.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 2 — Window size
// ═══════════════════════════════════════════════════════════════════════════════

function subscribeWindowResize(callback: () => void) {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}

function getWindowSizeSnapshot() {
  // Must return same reference if values haven't changed — otherwise infinite loop
  // Here we return a new object each time, but useSyncExternalStore compares via
  // Object.is by default — so we cache it (see useWindowSize below for fix)
  return `${window.innerWidth}x${window.innerHeight}`;
}

function useWindowSize() {
  const size = useSyncExternalStore(subscribeWindowResize, getWindowSizeSnapshot);
  const [width, height] = size.split("x").map(Number);
  return { width, height };
}

function WindowSizeDemo() {
  const { width, height } = useWindowSize();

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 2</p>
      <p className="demo__title">Window size — resize the browser to test</p>

      <div className="size-display">
        <div className="size-box">
          <p className="size-box__value">{width}px</p>
          <p className="size-box__label">Width</p>
        </div>
        <div className="size-box">
          <p className="size-box__value">{height}px</p>
          <p className="size-box__label">Height</p>
        </div>
      </div>

      <p className="demo__note">
        <code>getSnapshot</code> string return करतो (<code>"1024x768"</code>) — primitive,
        त्यामुळे same value असेल तर automatically referentially equal राहतो.
        Object return केलं असतं तर प्रत्येक call ला नवीन reference → infinite re-render.
      </p>

      <p className="demo__warning">
        ⚠️ <strong>getSnapshot rule:</strong> value न बदलल्यास same reference return करणं गरजेचं.
        Object/array असेल तर बाहेर cache कर, नाहीतर "getSnapshot should be cached" warning येतो.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 3 — Custom external store (mini Redux-like)
// ═══════════════════════════════════════════════════════════════════════════════

// A store that lives completely OUTSIDE React — plain JS, no useState
function createStore<T>(initialState: T) {
  let state = initialState;
  const listeners = new Set<() => void>();

  return {
    getState: () => state,
    setState: (updater: (prev: T) => T) => {
      state = updater(state);
      // Notify all subscribed components
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

// Single store instance — shared across the whole app, outside React tree
const counterStore = createStore({ count: 0 });

function useCounterStore() {
  const state = useSyncExternalStore(counterStore.subscribe, counterStore.getState);
  return state;
}

// Two independent components reading the SAME external store
function CounterDisplayA() {
  const { count } = useCounterStore();
  return (
    <div className="instance-row">
      <span className="instance-label">Component A</span>
      <span className="counter-value">{count}</span>
    </div>
  );
}

function CounterDisplayB() {
  const { count } = useCounterStore();
  return (
    <div className="instance-row">
      <span className="instance-label">Component B (different component, same store)</span>
      <span className="counter-value">{count}</span>
    </div>
  );
}

function CustomStoreDemo() {
  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 3</p>
      <p className="demo__title">Custom external store — mini Redux from scratch</p>

      <div className="btn-row">
        <button
          className="btn btn--ghost"
          onClick={() => counterStore.setState((s) => ({ count: s.count - 1 }))}
        >
          −
        </button>
        <button
          className="btn btn--primary"
          onClick={() => counterStore.setState((s) => ({ count: s.count + 1 }))}
        >
          +
        </button>
      </div>

      <CounterDisplayA />
      <CounterDisplayB />

      <p className="demo__note">
        <code>counterStore</code> — plain JS object, React component नाही, कुठेही import करता येतो.
        दोन्ही components (<code>A</code> आणि <code>B</code>) त्याच store ला subscribe करतात —
        दोन्ही simultaneously update होतात. हाच pattern Redux/Zustand internally वापरतात.
      </p>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function UseSyncExternalStoreDemo() {
  return (
    <div className="demo">
      <OnlineStatusDemo />
      <WindowSizeDemo />
      <CustomStoreDemo />
    </div>
  );
}