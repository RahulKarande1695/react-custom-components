/**
 * useLayoutEffect — 3 real-world patterns
 *
 * Key difference from useEffect:
 *   useEffect    — runs AFTER browser paints  → user sees render first, then effect
 *   useLayoutEffect — runs BEFORE browser paints → DOM read/write before user sees it
 *
 * When to use useLayoutEffect:
 * - DOM measurement (getBoundingClientRect, scrollHeight, offsetWidth)
 * - Position calculation (tooltip, popover, dropdown placement)
 * - Scroll manipulation (scroll to bottom before paint — no flicker)
 * - Preventing visual flicker from DOM mutations
 *
 * Rule of thumb:
 * - Start with useEffect
 * - Switch to useLayoutEffect only if you see a flicker/flash
 *
 * Pattern 1 — Tooltip positioning  : measure trigger, position tooltip above it
 * Pattern 2 — Scroll to bottom     : auto-scroll chat before paint (no jump)
 * Pattern 3 — DOM measurement      : read element size after render
 */

import { useState, useRef, useLayoutEffect } from "react";
import "./UseLayoutEffectDemo.css";

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 1 — Tooltip positioning
// ═══════════════════════════════════════════════════════════════════════════════

function TooltipDemo() {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // useLayoutEffect — measure trigger + tooltip BEFORE paint
  // If useEffect: tooltip flickers at wrong position for one frame
  useLayoutEffect(() => {
    if (!visible || !triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    setPosition({
      // Center tooltip above trigger
      top: triggerRect.top - tooltipRect.height - 8,
      left: triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2,
    });
  }, [visible]);

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 1</p>
      <p className="demo__title">Tooltip positioning — measure before paint</p>

      <div className="tooltip-wrap">
        <button
          ref={triggerRef}
          className="tooltip-trigger"
          onMouseEnter={() => setVisible(true)}
          onMouseLeave={() => setVisible(false)}
        >
          Hover me
        </button>

        {visible && (
          <div
            ref={tooltipRef}
            className="tooltip-box"
            role="tooltip"
            style={{ top: position.top, left: position.left }}
          >
            Positioned with useLayoutEffect ✓
          </div>
        )}
      </div>

      <p className="demo__note">
        <code>useLayoutEffect</code> measures the tooltip immediately after its
        DOM element is mounted and updates its position before the browser
        paints the screen. This ensures the tooltip is displayed in the correct
        location from the very first frame. If <code>useEffect</code> were used
        instead, the tooltip would briefly appear in the wrong position and then
        jump to its correct position, resulting in a visible flicker.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 2 — Scroll to bottom (chat)
// ═══════════════════════════════════════════════════════════════════════════════

interface Message {
  id: number;
  text: string;
  own: boolean;
}

const INITIAL_MESSAGES: Message[] = [
  { id: 1, text: "Hey! How are you?", own: false },
  { id: 2, text: "I'm good, thanks!", own: true },
  { id: 3, text: "Working on React hooks 🚀", own: true },
];

const RESPONSES = [
  "Cool!",
  "Nice 👍",
  "Tell me more.",
  "Interesting!",
  "Makes sense.",
];

function ChatDemo() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const bottomRef = useRef<HTMLDivElement>(null);
  let responseIdx = useRef(0);

  // useLayoutEffect — scroll BEFORE paint, no visible jump
  // useEffect would scroll after user already saw the non-scrolled state
  useLayoutEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" });
  }, [messages]);

  function addMessage() {
    const own = Math.random() > 0.4;
    const text = own
      ? "Sent another message!"
      : RESPONSES[responseIdx.current++ % RESPONSES.length];

    setMessages((prev) => [...prev, { id: Date.now(), text, own }]);
  }

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 2</p>
      <p className="demo__title">Scroll to bottom — before paint, no flicker</p>

      <div className="chat-window" role="log" aria-live="polite">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-msg${msg.own ? " chat-msg--own" : ""}`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <button className="add-msg-btn" onClick={addMessage}>
        Add message
      </button>

      <p className="demo__note">
        <code>scrollIntoView()</code> is executed before the browser paints the
        screen when used inside <code>useLayoutEffect</code>. This ensures the
        scroll position is updated before the user sees the new frame. If{" "}
        <code>useEffect</code> were used instead, the new message would briefly
        appear in its original position for one frame, and then the page would
        scroll, causing a noticeable visual jump.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 3 — DOM measurement
// ═══════════════════════════════════════════════════════════════════════════════

function MeasureDemo() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const boxRef = useRef<HTMLDivElement>(null);

  // Measure after every render — catches resize via ResizeObserver
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;

    // Initial measurement
    const rect = el.getBoundingClientRect();
    setDimensions({
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    });

    // ResizeObserver — re-measure when element size changes (e.g. resize handle)
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      setDimensions({
        width: Math.round(entry.contentRect.width),
        height: Math.round(entry.contentRect.height),
      });
    });

    observer.observe(el);
    return () => observer.disconnect(); // cleanup
  }, []);

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 3</p>
      <p className="demo__title">
        DOM measurement — ResizeObserver + useLayoutEffect
      </p>

      <div ref={boxRef} className="measure-box">
        Drag the right edge to resize this box →
      </div>

      <p className="measure-info">
        Width: {dimensions.width}px — Height: {dimensions.height}px
      </p>

      <p className="demo__note">
        <code>useLayoutEffect</code> combined with <code>ResizeObserver</code>{" "}
        allows element dimensions to be updated synchronously whenever the
        element is resized. This pattern is commonly used for layout-dependent
        components such as tooltips, popovers, dropdowns, and floating UI
        elements, where accurate measurements are required before the browser
        repaints the screen.
      </p>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function UseLayoutEffectDemo() {
  return (
    <div className="demo">
      <TooltipDemo />
      <ChatDemo />
      <MeasureDemo />
    </div>
  );
}
