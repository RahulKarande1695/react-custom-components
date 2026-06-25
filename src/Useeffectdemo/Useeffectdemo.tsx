/**
 * useEffect — 4 real-world patterns
 *
 * Rule: useEffect runs AFTER render + paint — async, non-blocking
 *
 * Dependency array behavior:
 *   useEffect(fn)        — runs after every render
 *   useEffect(fn, [])    — runs once on mount
 *   useEffect(fn, [dep]) — runs when dep changes
 *   return () => {}      — cleanup: runs before next effect or on unmount
 *
 * Pattern 1 — API fetch          : fetch on mount + re-fetch when id changes
 * Pattern 2 — Event listener     : add on mount, remove on unmount (cleanup)
 * Pattern 3 — Timer with cleanup : setInterval + clearInterval
 * Pattern 4 — localStorage sync  : sync state to storage on every change
 */

import { useState, useEffect, useRef } from "react";
import type { ChangeEvent } from "react";
import "./UseEffectDemo.css";

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 1 — API fetch + re-fetch on dep change
// ═══════════════════════════════════════════════════════════════════════════════

interface User {
  id: number;
  name: string;
  email: string;
}

function ApiFetchDemo() {
  const [userId, setUserId] = useState(1);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // AbortController — cancel in-flight request if userId changes before response
    const controller = new AbortController();

    async function fetchUser() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `https://jsonplaceholder.typicode.com/users/${userId}`,
          {
            signal: controller.signal,
          },
        );
        const data = (await res.json()) as User;
        setUser(data);
      } catch (err) {
        // AbortError is expected — don't show as error
        if ((err as Error).name !== "AbortError") {
          setError("Failed to fetch user.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchUser();

    // Cleanup — abort request if userId changes or component unmounts
    return () => controller.abort();
  }, [userId]); // re-runs every time userId changes

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 1</p>
      <p className="demo__title">API fetch — re-fetch on dependency change</p>

      <div className="id-btns">
        {[1, 2, 3, 4, 5].map((id) => (
          <button
            key={id}
            className={`id-btn${userId === id ? " id-btn--active" : ""}`}
            onClick={() => setUserId(id)}
          >
            User {id}
          </button>
        ))}
      </div>

      {error && <p style={{ color: "#ef4444", fontSize: 13 }}>{error}</p>}

      <div className={`user-card${loading ? " user-card--loading" : ""}`}>
        <div className="user-card__avatar">👤</div>
        <div>
          <p className="user-card__name">
            {loading ? "Loading..." : user?.name}
          </p>
          <p className="user-card__email">{loading ? "---" : user?.email}</p>
        </div>
      </div>

      <p className="demo__note">
        <code>AbortController</code> is used to cancel an in-progress request
        during the cleanup phase by calling <code>controller.abort()</code>. If
        the <code>userId</code> changes before the previous request completes,
        the earlier request is aborted, preventing stale or outdated data from
        updating the UI. This helps avoid race conditions and ensures that only
        the latest request updates the component.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 2 — Event listener with cleanup
// ═══════════════════════════════════════════════════════════════════════════════

function EventListenerDemo() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [inside, setInside] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;

    function handleMouseMove(e: MouseEvent) {
      const rect = box!.getBoundingClientRect();
      setPos({
        x: Math.round(e.clientX - rect.left),
        y: Math.round(e.clientY - rect.top),
      });
    }
    function handleEnter() {
      setInside(true);
    }
    function handleLeave() {
      setInside(false);
    }

    box.addEventListener("mousemove", handleMouseMove);
    box.addEventListener("mouseenter", handleEnter);
    box.addEventListener("mouseleave", handleLeave);

    // Cleanup — remove listeners on unmount to prevent memory leak
    return () => {
      box.removeEventListener("mousemove", handleMouseMove);
      box.removeEventListener("mouseenter", handleEnter);
      box.removeEventListener("mouseleave", handleLeave);
    };
  }, []); // [] — attach once on mount, cleanup on unmount

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 2</p>
      <p className="demo__title">
        Event listener — add on mount, cleanup on unmount
      </p>

      <div
        ref={boxRef}
        className={`mouse-box${inside ? " mouse-box--active" : ""}`}
      >
        {inside ? `x: ${pos.x}, y: ${pos.y}` : "Move mouse here"}
      </div>

      <p className="demo__note">
        The cleanup function removes the event listener using{" "}
        <code>removeEventListener</code>. Without this cleanup, the listener
        remains attached even after the component unmounts, leading to memory
        leaks and unexpected behavior, such as callbacks continuing to run or
        multiple event listeners being registered when the component mounts
        again.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 3 — setInterval with cleanup
// ═══════════════════════════════════════════════════════════════════════════════

function TimerDemo() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return; // effect conditionally does nothing

    const id = setInterval(() => {
      setSeconds((prev) => prev + 1); // functional update — no stale closure
    }, 1000);

    // Cleanup — clear interval when running becomes false or component unmounts
    return () => clearInterval(id);
  }, [running]); // re-runs when running changes

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 3</p>
      <p className="demo__title">
        setInterval — cleanup prevents multiple intervals
      </p>

      <p className="timer-display">
        {String(Math.floor(seconds / 60)).padStart(2, "0")}:
        {String(seconds % 60).padStart(2, "0")}
      </p>

      <div className="timer-btns">
        <button
          className="timer-btn timer-btn--primary"
          onClick={() => setRunning((prev) => !prev)}
        >
          {running ? "Pause" : "Start"}
        </button>
        <button
          className="timer-btn timer-btn--ghost"
          onClick={() => {
            setRunning(false);
            setSeconds(0);
          }}
        >
          Reset
        </button>
      </div>

      <p className="demo__note">
        The cleanup function calls <code>clearInterval</code> to stop the active
        interval whenever <code>running</code> becomes <code>false</code> or the
        effect re-runs. Without this cleanup, every click on{" "}
        <strong>Start</strong> or <strong>Pause</strong> could create a new
        interval, causing multiple intervals to run simultaneously and making
        the timer increment much faster than expected.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 4 — localStorage sync
// ═══════════════════════════════════════════════════════════════════════════════

function LocalStorageDemo() {
  const [text, setText] = useState(() => {
    // Lazy init — read from localStorage on first render only
    return localStorage.getItem("demo_text") ?? "";
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Sync to localStorage every time text changes
    localStorage.setItem("demo_text", text);
    setSaved(true);

    // Reset "Saved" badge after 1.5s
    const id = setTimeout(() => setSaved(false), 1500);
    return () => clearTimeout(id);
  }, [text]); // runs when text changes

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 4</p>
      <p className="demo__title">
        localStorage sync — side effect on state change
      </p>

      <div className="sync-row">
        <input
          className="sync-input"
          value={text}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setText(e.target.value)
          }
          placeholder="Type something — auto saved..."
          aria-label="Auto-save input"
        />
        {saved && <span className="sync-badge">Saved ✓</span>}
      </div>

      <p className="demo__note">
        <code>useEffect([text])</code> runs whenever <code>text</code> changes
        and synchronizes the latest value with <code>localStorage</code>. On
        page refresh, the state is restored from <code>localStorage</code> using
        lazy initialization, so the previously saved value is loaded
        automatically. The cleanup function calls <code>clearTimeout</code>,
        ensuring that pending timers are canceled during rapid typing, which
        prevents the "Saved" badge from flickering.
      </p>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function UseEffectDemo() {
  return (
    <div className="demo">
      <ApiFetchDemo />
      <EventListenerDemo />
      <TimerDemo />
      <LocalStorageDemo />
    </div>
  );
}
