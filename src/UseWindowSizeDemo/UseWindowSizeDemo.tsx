/**
 * useWindowSize — custom hook (not built into React)
 *
 * Tracks window dimensions reactively — re-renders component when
 * the browser is resized. Combines useState + useEffect + resize listener
 * + throttling (to avoid excessive re-renders during drag-resize).
 *
 *   const { width, height } = useWindowSize();
 *
 * Why not just read window.innerWidth directly in render?
 * - window.innerWidth is NOT reactive — reading it doesn't trigger re-render
 * - Need a listener + state to make component respond to resize
 *
 * Common real-world uses:
 * - Responsive layout logic in JS (when CSS media queries aren't enough)
 * - Conditionally rendering different components for mobile vs desktop
 * - Charts/canvases that need exact pixel dimensions
 *
 * Note: For pure styling, CSS media queries are usually better — this hook
 * is for when you need the actual pixel values in JavaScript logic.
 *
 * Pattern 1 — Breakpoint detector   : mobile/tablet/desktop badge
 * Pattern 2 — Responsive grid columns : column count changes with width
 */

import { useState, useEffect, useRef } from "react";
import "./UseWindowSizeDemo.css";

// ═══════════════════════════════════════════════════════════════════════════════
// The custom hook itself
// ═══════════════════════════════════════════════════════════════════════════════

interface WindowSize {
  width: number;
  height: number;
}

function useWindowSize(throttleMs = 150): WindowSize {
  const [size, setSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleResize() {
      // Throttle — resize fires VERY frequently during drag, don't setState every time
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setSize({ width: window.innerWidth, height: window.innerHeight });
      }, throttleMs);
    }

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [throttleMs]);

  return size;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 1 — Breakpoint detector
// ═══════════════════════════════════════════════════════════════════════════════

type Breakpoint = "mobile" | "tablet" | "desktop";

function getBreakpoint(width: number): Breakpoint {
  if (width < 640) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

function BreakpointDemo() {
  const { width, height } = useWindowSize();
  const breakpoint = getBreakpoint(width);

  const emoji: Record<Breakpoint, string> = {
    mobile: "📱",
    tablet: "📱",
    desktop: "🖥️",
  };

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 1</p>
      <p className="demo__title">
        Breakpoint detector — resize browser to test
      </p>

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

      <span className={`breakpoint-badge breakpoint-badge--${breakpoint}`}>
        {emoji[breakpoint]} {breakpoint.toUpperCase()} (
        {"<640: mobile, <1024: tablet, else desktop"})
      </span>

      <p className="demo__note">
        Try resizing the browser window—the displayed values update in real
        time. The internal resize handler is throttled to run at most once every
        150ms. During a drag-resize operation, the browser can fire hundreds or
        even thousands of
        <code>resize</code> events, but throttling ensures that{" "}
        <code>setState</code> is called only at fixed intervals. This reduces
        unnecessary re-renders while keeping the UI responsive and up to date.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 2 — Responsive grid columns (JS-driven, not CSS)
// ═══════════════════════════════════════════════════════════════════════════════

function getColumnCount(width: number): number {
  if (width < 480) return 1;
  if (width < 768) return 2;
  if (width < 1100) return 3;
  return 4;
}

function ResponsiveGridDemo() {
  const { width } = useWindowSize();
  const columns = getColumnCount(width);

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 2</p>
      <p className="demo__title">Responsive grid — column count driven by JS</p>

      <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
        Current columns: <strong style={{ color: "#111827" }}>{columns}</strong>{" "}
        (window: {width}px)
      </p>

      <div
        className="responsive-grid"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="grid-item">
            Card {i + 1}
          </div>
        ))}
      </div>

      <p className="demo__note">
        In many cases, CSS Grid and media queries are sufficient for building
        responsive layouts. However, some scenarios require the actual element
        dimensions to be available in JavaScript—for example, when calculating
        the number of columns for a virtualized list, positioning canvas
        drawings, or performing other layout-dependent computations. In such
        cases, a custom measurement hook (often using{" "}
        <code>ResizeObserver</code>) is the appropriate solution because it
        provides the current pixel dimensions directly to your JavaScript logic.
      </p>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function UseWindowSizeDemo() {
  return (
    <div className="demo">
      <BreakpointDemo />
      <ResponsiveGridDemo />
    </div>
  );
}
