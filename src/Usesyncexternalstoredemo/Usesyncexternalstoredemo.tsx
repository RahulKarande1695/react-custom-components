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

      <span
        className={`status-badge status-badge--${isOnline ? "online" : "offline"}`}
      >
        <span
          className={`status-dot ${isOnline ? "status-dot--online" : ""}`}
        />
        {isOnline ? "Online" : "Offline"}
      </span>

      <p className="demo__note">
        <code>navigator.onLine</code> represents external browser state that
        exists outside of React. Try disconnecting and reconnecting your
        Wi-Fi—the component automatically stays in sync with the browser's
        online status. When using <code>useSyncExternalStore</code>, you don't
        need to manually write <code>useEffect</code> event listeners or manage
        synchronization yourself; React handles updates whenever the external
        store changes.
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
  const size = useSyncExternalStore(
    subscribeWindowResize,
    getWindowSizeSnapshot,
  );
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
        <code>getSnapshot</code> returns a string (for example,{" "}
        <code>"1024x768"</code>), which is a primitive value. When the value
        does not change, React considers it equal automatically, so no
        unnecessary re-render occurs. If <code>getSnapshot</code> returned a new
        object on every call, each object would have a different reference,
        causing React to treat it as a changed snapshot and potentially
        triggering an infinite re-render loop.
      </p>

      <p className="demo__warning">
        ⚠️{" "}
        <strong>
          <code>getSnapshot</code> rule:
        </strong>{" "}
        If the underlying data has not changed, <code>getSnapshot</code> must
        return the same reference. When returning an object or array, cache the
        value outside of <code>getSnapshot</code> and reuse it until the data
        changes. Otherwise, React may display the warning{" "}
        <code>"The result of getSnapshot should be cached"</code>
        and repeatedly re-render the component.
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
  const state = useSyncExternalStore(
    counterStore.subscribe,
    counterStore.getState,
  );
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
      <span className="instance-label">
        Component B (different component, same store)
      </span>
      <span className="counter-value">{count}</span>
    </div>
  );
}

function CustomStoreDemo() {
  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 3</p>
      <p className="demo__title">
        Custom external store — mini Redux from scratch
      </p>

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
        <code>counterStore</code> is a plain JavaScript object, not a React
        component, so it can be imported and used anywhere in the application.
        Both components,
        <code>A</code> and <code>B</code>, subscribe to the same store, allowing
        them to stay synchronized and update simultaneously whenever the store's
        state changes. This subscription-based architecture is the same
        fundamental pattern used internally by state management libraries such
        as Redux and Zustand.
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
