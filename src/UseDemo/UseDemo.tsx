/**
 * use (React 19) — reading Promises and Context inside render
 *
 * `use` is NOT a traditional hook — it can be called conditionally,
 * inside loops, after early returns. Regular hooks (useState, useEffect)
 * cannot break the "rules of hooks" — `use` can.
 *
 * Two things `use` can read:
 * 1. A Promise — suspends the component until resolved (works with <Suspense>)
 * 2. A Context — same as useContext, but can be called conditionally
 *
 *   const data = use(promise);       // suspends until promise resolves
 *   const theme = use(ThemeContext);  // same as useContext, but conditional
 *
 * use vs useEffect for data fetching:
 * ┌────────────────────┬───────────────────────┬───────────────────────┐
 * │                    │   useEffect + useState │   use + Suspense      │
 * ├────────────────────┼───────────────────────┼───────────────────────┤
 * │ Loading state      │ Manual (isLoading)     │ Automatic (Suspense)  │
 * │ Error handling     │ Manual (try/catch)     │ Automatic (ErrorBoundary)│
 * │ Waterfalls         │ Easy to create by mistake│ Parallel by default │
 * │ Can be conditional │ No (rules of hooks)     │ Yes                  │
 * └────────────────────┴───────────────────────┴───────────────────────┘
 *
 * Pattern 1 — use(promise) + Suspense  : fetch user, suspends until ready
 * Pattern 2 — use(Context) conditional : read context only when needed
 */

import { use, useState, Suspense, createContext } from "react";
import "./UseDemo.css";

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 1 — use(promise) with Suspense
// ═══════════════════════════════════════════════════════════════════════════════

interface User {
  id: number;
  name: string;
  email: string;
}

// Cache promises by id — without this, every render creates a NEW promise
// and the component suspends forever (infinite loading)
const userPromiseCache = new Map<number, Promise<User>>();

function getUserPromise(id: number): Promise<User> {
  if (!userPromiseCache.has(id)) {
    const promise = fetch(
      `https://jsonplaceholder.typicode.com/users/${id}`,
    ).then((res) => {
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    });
    userPromiseCache.set(id, promise);
  }
  return userPromiseCache.get(id)!;
}

// This component "suspends" — React shows nearest <Suspense fallback> while waiting
function UserProfile({ userId }: { userId: number }) {
  // use() unwraps the promise — pauses rendering until resolved
  // Must be wrapped in <Suspense> by a parent, or React throws
  const user = use(getUserPromise(userId));

  return (
    <div className="user-card">
      <div className="user-card__avatar">👤</div>
      <div>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{user.name}</p>
        <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280" }}>
          {user.email}
        </p>
      </div>
    </div>
  );
}

// Skeleton shown automatically while UserProfile suspends — no isLoading state needed
function UserSkeleton() {
  return (
    <div className="user-card">
      <div className="user-card__avatar" />
      <div
        style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}
      >
        <div className="skeleton-row" style={{ width: "60%" }} />
        <div className="skeleton-row" style={{ width: "80%" }} />
      </div>
    </div>
  );
}

function PromiseDemo() {
  const [userId, setUserId] = useState(1);

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 1</p>
      <p className="demo__title">
        use(promise) + Suspense — no manual loading state
      </p>

      <div className="btn-row">
        {[1, 2, 3].map((id) => (
          <button
            key={id}
            className={`btn ${userId === id ? "btn--primary" : "btn--ghost"}`}
            onClick={() => setUserId(id)}
          >
            User {id}
          </button>
        ))}
      </div>

      {/* key={userId} forces remount → new Suspense boundary triggers fallback */}
      <Suspense fallback={<UserSkeleton />}>
        <UserProfile key={userId} userId={userId} />
      </Suspense>

      <p className="demo__note">
        <code>use(getUserPromise(userId))</code> causes the component to suspend
        until the promise resolves. While the data is being loaded, the{" "}
        <code>UserSkeleton</code> fallback is displayed automatically by{" "}
        <code>Suspense</code>, eliminating the need to manage a separate{" "}
        <code>isLoading</code> state.
      </p>

      <p className="demo__warning">
        ⚠️ <strong>Promise caching is essential:</strong> If a new promise is
        created on every render, the component will keep suspending because
        React never sees the same promise resolve. This results in an infinite
        suspend loop, preventing the component from ever rendering its final
        content.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 2 — use(Context) conditionally
// ═══════════════════════════════════════════════════════════════════════════════

interface ThemeValue {
  bg: string;
  text: string;
  name: string;
}
const ThemeContext = createContext<ThemeValue>({
  bg: "#fff",
  text: "#111827",
  name: "light",
});

// Regular useContext CANNOT be called after a condition/early return.
// use() CAN — this is the key difference from useContext.
function ConditionalThemeReader({ showTheme }: { showTheme: boolean }) {
  if (!showTheme) {
    // With useContext, this early return BEFORE the hook call would break
    // the rules of hooks. With use(), this is perfectly valid.
    return (
      <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>
        Theme reading skipped.
      </p>
    );
  }

  // use() called conditionally — only runs when showTheme is true
  const theme = use(ThemeContext);

  return (
    <div
      className="theme-box"
      style={{ background: theme.bg, color: theme.text }}
    >
      Current theme: <strong>{theme.name}</strong>
    </div>
  );
}

function ContextDemo() {
  const [showTheme, setShowTheme] = useState(true);
  const [theme, setTheme] = useState<ThemeValue>({
    bg: "#ede9fe",
    text: "#5b21b6",
    name: "violet",
  });

  return (
    <ThemeContext.Provider value={theme}>
      <div className="demo__section">
        <p className="demo__label">Pattern 2</p>
        <p className="demo__title">
          use(Context) — callable conditionally, unlike useContext
        </p>

        <div className="btn-row">
          <button
            className="btn btn--ghost"
            onClick={() => setShowTheme((p) => !p)}
          >
            {showTheme ? "Hide" : "Show"} theme reader
          </button>
          <button
            className="btn btn--ghost"
            onClick={() =>
              setTheme({ bg: "#fef3c7", text: "#92400e", name: "amber" })
            }
          >
            Amber theme
          </button>
          <button
            className="btn btn--ghost"
            onClick={() =>
              setTheme({ bg: "#ede9fe", text: "#5b21b6", name: "violet" })
            }
          >
            Violet theme
          </button>
        </div>

        <ConditionalThemeReader showTheme={showTheme} />

        <div className="compare">
          <div className="compare__cell compare__cell--header">useContext</div>
          <div className="compare__cell compare__cell--header">
            use(Context)
          </div>
          <div className="compare__cell compare__cell--bad">
            Must be called unconditionally, top of component
          </div>
          <div className="compare__cell compare__cell--good">
            Can be called after if/return, inside loops ✓
          </div>
        </div>

        <p className="demo__note">
          In <code>ConditionalThemeReader</code>, <code>use(ThemeContext)</code>{" "}
          is called after an early <code>return</code>. This pattern would
          trigger an ESLint
          <strong> Rules of Hooks</strong> error if you used{" "}
          <code>useContext</code>, because hooks must be called unconditionally.
          However, <code>use()</code> is an exception—it can be called
          conditionally, making this pattern valid in React.
        </p>
      </div>
    </ThemeContext.Provider>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function UseHookDemo() {
  return (
    <div className="demo">
      <PromiseDemo />
      <ContextDemo />
    </div>
  );
}
