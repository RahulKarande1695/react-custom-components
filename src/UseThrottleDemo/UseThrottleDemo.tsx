/**
 * useThrottle — custom hook (not built into React)
 *
 * Limits how often a value/function updates — fires at most once per
 * interval, REGARDLESS of how many times the source event fires.
 *
 *   const throttledValue = useThrottle(value, limit);
 *
 * Throttle vs Debounce (key interview distinction):
 * - Debounce — waits for a PAUSE, then fires once (good for: search input)
 * - Throttle — fires at REGULAR intervals during continuous activity
 *              (good for: scroll, mouse move, resize — need periodic updates,
 *               not just the final one)
 *
 * Real-world analogy:
 * - Debounce = elevator door — waits until no one's entering, then closes
 * - Throttle = bus schedule — leaves every 10 min regardless of how many
 *              people are still arriving
 *
 * Pattern 1 — Mouse tracking   : throttled dot vs instant dot (visual lag comparison)
 * Pattern 2 — Scroll progress  : throttled scroll handler, call count comparison
 */

import { useState, useEffect, useRef, useCallback } from "react";
import "./UseThrottleDemo.css";

// ═══════════════════════════════════════════════════════════════════════════════
// The custom hook itself
// ═══════════════════════════════════════════════════════════════════════════════

function useThrottle<T>(value: T, limit: number): T {
  const [throttled, setThrottled] = useState(value);
  const lastRanRef = useRef(Date.now());

  useEffect(() => {
    const now = Date.now();

    if (now - lastRanRef.current >= limit) {
      // Enough time has passed — update immediately
      setThrottled(value);
      lastRanRef.current = now;
    } else {
      // Not enough time passed — schedule update for when interval completes
      const timeoutId = setTimeout(
        () => {
          setThrottled(value);
          lastRanRef.current = Date.now();
        },
        limit - (now - lastRanRef.current),
      );

      return () => clearTimeout(timeoutId);
    }
  }, [value, limit]);

  return throttled;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 1 — Mouse tracking: instant vs throttled dot
// ═══════════════════════════════════════════════════════════════════════════════

function MouseTrackDemo() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const throttledPos = useThrottle(pos, 200);

  const instantCalls = useRef(0);
  const throttledCalls = useRef(0);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    instantCalls.current += 1;
  }

  useEffect(() => {
    throttledCalls.current += 1;
  }, [throttledPos]);

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 1</p>
      <p className="demo__title">
        Mouse tracking — instant dot (red) vs throttled dot (green)
      </p>

      <div className="track-box" onMouseMove={handleMouseMove}>
        <span className="track-hint">Move mouse here</span>
        <div
          className="track-dot track-dot--instant"
          style={{ left: pos.x, top: pos.y }}
        />
        <div
          className="track-dot track-dot--throttled"
          style={{ left: throttledPos.x, top: throttledPos.y }}
        />
      </div>

      <div className="call-log">
        <div className="call-row call-row--instant">
          <span className="call-label">Instant updates (red dot)</span>
          <span className="call-count">{instantCalls.current}</span>
        </div>
        <div className="call-row call-row--throttled">
          <span className="call-label">
            Throttled updates — max 1 per 200ms (green dot)
          </span>
          <span className="call-count">{throttledCalls.current}</span>
        </div>
      </div>

      <p className="demo__note">
        As you move the mouse, the red dot follows immediately because it
        updates on every mouse event, which can occur more than 100 times per
        second. The green dot, however, updates only once every 200ms using
        throttling. Despite the reduced update frequency, the movement still
        appears smooth while significantly lowering the number of state updates
        and re-renders. This is a common and effective optimization for
        high-frequency events such as <code>scroll</code>, <code>resize</code>,
        and <code>mousemove</code>.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 2 — Scroll progress with throttled handler
// ═══════════════════════════════════════════════════════════════════════════════

// Throttle a CALLBACK (not just a value) — common real-world variant
function useThrottledCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  limit: number,
) {
  const lastRanRef = useRef(0);

  return useCallback(
    (...args: Args) => {
      const now = Date.now();
      if (now - lastRanRef.current >= limit) {
        callback(...args);
        lastRanRef.current = now;
      }
      // If called too soon, this call is simply dropped (no trailing call here)
    },
    [callback, limit],
  );
}

function ScrollProgressDemo() {
  const [progress, setProgress] = useState(0);
  const instantScrollCount = useRef(0);
  const throttledScrollCount = useRef(0);

  // Throttled version — fires at most once every 150ms during scroll
  const throttledHandler = useThrottledCallback(
    (scrollTop: number, scrollHeight: number) => {
      setProgress(Math.round((scrollTop / scrollHeight) * 100));
      throttledScrollCount.current += 1;
    },
    150,
  );

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    instantScrollCount.current += 1;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    throttledHandler(scrollTop, scrollHeight - clientHeight);
  }

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 2</p>
      <p className="demo__title">Scroll progress — throttled scroll handler</p>

      <div className="scroll-box" onScroll={handleScroll}>
        <div className="scroll-content">Scroll inside this box ↕</div>
      </div>

      <div className="scroll-progress">
        <div
          className="scroll-progress__fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
        Progress: {progress}%
      </p>

      <div className="call-log">
        <div className="call-row call-row--instant">
          <span className="call-label">Raw scroll events fired</span>
          <span className="call-count">{instantScrollCount.current}</span>
        </div>
        <div className="call-row call-row--throttled">
          <span className="call-label">
            Throttled handler calls (max 1/150ms)
          </span>
          <span className="call-count">{throttledScrollCount.current}</span>
        </div>
      </div>

      <div className="compare">
        <div className="compare__cell compare__cell--header">
          Without throttle
        </div>
        <div className="compare__cell compare__cell--header">With throttle</div>
        <div className="compare__cell compare__cell--bad">
          setState fires 60-100+ times/sec during scroll — janky, expensive
        </div>
        <div className="compare__cell compare__cell--good">
          setState fires max 6-7 times/sec — smooth, cheap ✓
        </div>
      </div>

      <p className="demo__note">
        <code>useThrottledCallback</code> throttles a function, not a value.
        Scroll events can fire dozens of times per second, but the throttled
        callback updates the progress bar only once every 150ms. This
        significantly reduces the number of state updates and re-renders, making
        scrolling smoother and improving performance—especially on mobile
        devices and lower-powered hardware.
      </p>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function UseThrottleDemo() {
  return (
    <div className="demo">
      <MouseTrackDemo />
      <ScrollProgressDemo />
    </div>
  );
}
