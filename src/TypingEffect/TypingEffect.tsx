/**
 * TypingEffect — Render Prop Pattern
 *
 * Pattern: Render Props + custom hook
 *
 * Why render prop?
 * - Consumer decides how to render the text — h1, p, span, anything
 * - Hook (useTypingEffect) is reusable independently
 * - Component (TypingEffect) wraps hook + exposes via render prop
 *
 * Usage:
 *   // Via component (render prop)
 *   <TypingEffect
 *     texts={["Hello", "World"]}
 *     render={({ text, isDone }) => <h1>{text}</h1>}
 *   />
 *
 *   // Via hook directly
 *   const { text, isDone } = useTypingEffect({ texts: ["Hello"] });
 */

import { useState, useEffect, useRef } from "react";
import "./TypingEffect.css";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TypingEffectOptions {
  texts: string[];
  typeSpeed?: number;    // ms per character while typing
  deleteSpeed?: number;  // ms per character while deleting
  pauseAfter?: number;   // ms to pause after fully typed
  pauseBefore?: number;  // ms to pause before typing next word
  loop?: boolean;
}

interface TypingState {
  text: string;          // current visible text
  isDone: boolean;       // true when finished (loop=false and last text done)
  isTyping: boolean;     // true while typing forward
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTypingEffect({
  texts,
  typeSpeed = 80,
  deleteSpeed = 40,
  pauseAfter = 1500,
  pauseBefore = 300,
  loop = true,
}: TypingEffectOptions): TypingState {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping]       = useState(true);
  const [isDone, setIsDone]           = useState(false);

  // Refs to avoid stale closures in setTimeout
  const textIdxRef   = useRef(0);
  const charIdxRef   = useRef(0);
  const deletingRef  = useRef(false);
  const timeoutRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!texts.length) return;

    function tick() {
      const currentText = texts[textIdxRef.current];

      if (!deletingRef.current) {
        // ── Typing forward ──
        charIdxRef.current += 1;
        setDisplayText(currentText.slice(0, charIdxRef.current));
        setIsTyping(true);

        if (charIdxRef.current === currentText.length) {
          // Fully typed — check if last text and no loop
          const isLast = textIdxRef.current === texts.length - 1;
          if (!loop && isLast) {
            setIsDone(true);
            return;
          }
          // Pause then start deleting
          deletingRef.current = true;
          timeoutRef.current = setTimeout(tick, pauseAfter);
          return;
        }
      } else {
        // ── Deleting ──
        charIdxRef.current -= 1;
        setDisplayText(currentText.slice(0, charIdxRef.current));
        setIsTyping(false);

        if (charIdxRef.current === 0) {
          // Fully deleted — move to next text
          deletingRef.current = false;
          textIdxRef.current  = (textIdxRef.current + 1) % texts.length;
          timeoutRef.current  = setTimeout(tick, pauseBefore);
          return;
        }
      }

      timeoutRef.current = setTimeout(
        tick,
        deletingRef.current ? deleteSpeed : typeSpeed
      );
    }

    timeoutRef.current = setTimeout(tick, pauseBefore);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  // texts array reference changes break the effect — join as stable dep
  }, [texts.join("|"), typeSpeed, deleteSpeed, pauseAfter, pauseBefore, loop]);

  return { text: displayText, isDone, isTyping };
}

// ─── Component (Render Prop) ──────────────────────────────────────────────────

interface TypingEffectProps extends TypingEffectOptions {
  render: (state: TypingState & { cursor: React.ReactNode }) => React.ReactNode;
  showCursor?: boolean;
}

export function TypingEffect({
  render,
  showCursor = true,
  ...options
}: TypingEffectProps) {
  const state = useTypingEffect(options);

  const cursor = showCursor ? (
    <span
      className={`typing__cursor${state.isDone ? " typing__cursor--hidden" : ""}`}
      aria-hidden
    />
  ) : null;

  return <>{render({ ...state, cursor })}</>;
}

export default TypingEffect;