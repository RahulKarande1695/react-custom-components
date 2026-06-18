/**
 * useContext — 3 real-world patterns + prop drilling comparison
 *
 * Problem useContext solves: Prop Drilling
 * - Without context: A → B → C → D — every component passes props down
 * - With context: A provides, D consumes — B and C don't need to know
 *
 * Key rules:
 * - Context re-renders ALL consumers when value changes
 * - Split contexts by update frequency to avoid unnecessary re-renders
 * - Always throw meaningful error if used outside Provider
 *
 * Pattern 1 — Prop drilling vs Context  : visual comparison
 * Pattern 2 — Theme context             : real-world dark/light switch
 * Pattern 3 — Auth context              : user role based UI
 */

import { useState, useContext, createContext } from "react";
import type { ReactNode } from "react";
import "./UseContextDemo.css";

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 1 — Prop drilling vs Context (visual)
// ═══════════════════════════════════════════════════════════════════════════════

function PropDrillingDemo() {
  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 1</p>
      <p className="demo__title">Prop drilling problem → Context solution</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Without context — prop drilling */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#b91c1c", margin: "0 0 6px" }}>
            ✗ Prop Drilling
          </p>
          <div className="tree">
            <div className="tree__node tree__node--root">App (user)</div>
            <div className="tree__node tree__node--mid-bad">Layout (user) 👎</div>
            <div className="tree__node tree__node--mid-bad">Sidebar (user) 👎</div>
            <div className="tree__node tree__node--leaf">Avatar (user) ✓</div>
          </div>
        </div>

        {/* With context */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#15803d", margin: "0 0 6px" }}>
            ✓ Context
          </p>
          <div className="tree">
            <div className="tree__node tree__node--root">App (Provider)</div>
            <div className="tree__node tree__node--mid">Layout</div>
            <div className="tree__node tree__node--mid">Sidebar</div>
            <div className="tree__node tree__node--leaf">Avatar (consumer) ✓</div>
          </div>
        </div>
      </div>

      <div className="compare">
        <div className="compare__cell compare__cell--header">Prop Drilling</div>
        <div className="compare__cell compare__cell--header">Context</div>
        <div className="compare__cell compare__cell--bad">Middle components get unnecessary props</div>
        <div className="compare__cell compare__cell--good">Middle components stay clean</div>
        <div className="compare__cell compare__cell--bad">Refactor pain when prop added/removed</div>
        <div className="compare__cell compare__cell--good">One place to update</div>
        <div className="compare__cell compare__cell--good">Explicit data flow</div>
        <div className="compare__cell compare__cell--bad">Harder to trace data source</div>
      </div>

      <p className="demo__note">
        Context overkill असतो जेव्हा फक्त 1-2 levels खाली pass करायचं असेल.
        3+ levels, global state (theme, auth, locale) साठी context योग्य आहे.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 2 — Theme context
// ═══════════════════════════════════════════════════════════════════════════════

type ThemeMode = "light" | "dark" | "ocean";

interface ThemeTokens {
  bg: string;
  surface: string;
  text: string;
  accent: string;
  accentText: string;
}

const THEME_MAP: Record<ThemeMode, ThemeTokens> = {
  light: { bg: "#f8fafc", surface: "#fff",     text: "#111827", accent: "#111827", accentText: "#fff" },
  dark:  { bg: "#0f172a", surface: "#1e293b",  text: "#f1f5f9", accent: "#818cf8", accentText: "#fff" },
  ocean: { bg: "#eff6ff", surface: "#dbeafe",  text: "#1e3a5f", accent: "#2563eb", accentText: "#fff" },
};

interface ThemeContextValue {
  mode: ThemeMode;
  tokens: ThemeTokens;
  setMode: (m: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}

// Deeply nested component — consumes theme without any prop drilling
function ThemedCard() {
  const { tokens, mode } = useTheme();
  return (
    <div
      className="themed-card"
      style={{ background: tokens.surface, border: `1px solid ${tokens.accent}22` }}
    >
      <p className="themed-card__title" style={{ color: tokens.text }}>
        {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode
      </p>
      <p className="themed-card__body" style={{ color: tokens.text }}>
        This card reads theme from Context — no props passed.
      </p>
    </div>
  );
}

function ThemeContextDemo() {
  const [mode, setMode] = useState<ThemeMode>("light");
  const tokens = THEME_MAP[mode];

  return (
    // Provider wraps subtree — all children can consume
    <ThemeContext.Provider value={{ mode, tokens, setMode }}>
      <div className="demo__section">
        <p className="demo__label">Pattern 2</p>
        <p className="demo__title">Theme context — global tokens without prop drilling</p>

        <div className="btn-row">
          {(["light", "dark", "ocean"] as ThemeMode[]).map((m) => (
            <button
              key={m}
              className={`btn ${mode === m ? "btn--primary" : "btn--ghost"}`}
              onClick={() => setMode(m)}
            >
              {m}
            </button>
          ))}
        </div>

        {/* ThemedCard is a nested consumer — gets theme via context */}
        <ThemedCard />

        {/* <p className="demo__note">
          <code>ThemeContext.Provider value={"{"}{ mode, tokens, setMode }{"}"}</code> —
          value बदलल्यावर सगळे consumers re-render होतात.
          Performance tip: <code>tokens</code> आणि <code>setMode</code> वेगळ्या contexts मध्ये
          split करतात — setMode consumers फक्त mode change वर render होतात.
        </p> */}
      </div>
    </ThemeContext.Provider>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 3 — Auth context
// ═══════════════════════════════════════════════════════════════════════════════

type Role = "admin" | "user" | "guest";

interface AuthUser {
  name: string;
  email: string;
  role: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

const MOCK_USERS: Record<Role, AuthUser> = {
  admin: { name: "Rahul Admin",  email: "admin@app.com",  role: "admin" },
  user:  { name: "Rahul User",   email: "user@app.com",   role: "user"  },
  guest: { name: "Guest",        email: "guest@app.com",  role: "guest" },
};

// Role-gated component — shows content based on role
function RoleGate({ allowed, children }: { allowed: Role[]; children: ReactNode }) {
  const { user } = useAuth();
  if (!user || !allowed.includes(user.role)) {
    return (
      <p style={{ fontSize: 13, color: "#b91c1c", background: "#fef2f2",
        padding: "6px 10px", borderRadius: 6, margin: 0 }}>
        ⛔ Access denied for role: {user?.role ?? "guest"}
      </p>
    );
  }
  return <>{children}</>;
}

function AuthDisplay() {
  const { user, logout } = useAuth();
  if (!user) return null;

  const roleColors: Record<Role, string> = {
    admin: "auth-card__role--admin",
    user:  "auth-card__role--user",
    guest: "auth-card__role--guest",
  };

  return (
    <div className="auth-card">
      <div>
        <p className="auth-card__info">{user.name}</p>
        <p style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0" }}>{user.email}</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span className={`auth-card__role ${roleColors[user.role]}`}>{user.role}</span>
        <button className="btn btn--ghost" style={{ height: 28, fontSize: 12 }} onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}

function AuthContextDemo() {
  const [user, setUser] = useState<AuthUser | null>(null);

  return (
    <AuthContext.Provider value={{
      user,
      login: (role) => setUser(MOCK_USERS[role]),
      logout: () => setUser(null),
    }}>
      <div className="demo__section">
        <p className="demo__label">Pattern 3</p>
        <p className="demo__title">Auth context — role-based access control</p>

        {!user ? (
          <div className="btn-row">
            {(["admin", "user", "guest"] as Role[]).map((role) => (
              <button
                key={role}
                className="btn btn--ghost"
                onClick={() => setUser(MOCK_USERS[role])}
              >
                Login as {role}
              </button>
            ))}
          </div>
        ) : (
          <>
            <AuthDisplay />
            {/* RoleGate — reads auth from context, no props needed */}
            <RoleGate allowed={["admin"]}>
              <p style={{ fontSize: 13, color: "#15803d", background: "#f0fdf4",
                padding: "6px 10px", borderRadius: 6, margin: 0 }}>
                ✓ Admin panel — only admins see this
              </p>
            </RoleGate>
            <RoleGate allowed={["admin", "user"]}>
              <p style={{ fontSize: 13, color: "#1d4ed8", background: "#eff6ff",
                padding: "6px 10px", borderRadius: 6, margin: 0 }}>
                ✓ Dashboard — admins and users see this
              </p>
            </RoleGate>
          </>
        )}

        <p className="demo__note">
          <code>useAuth()</code> — context hook with guard.
          <code>RoleGate</code> — <code>allowed</code> roles array check करतो, context मधून user वाचतो.
          Real apps मध्ये हाच pattern React Router <code>loader</code> सोबत वापरतात.
        </p>
      </div>
    </AuthContext.Provider>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function UseContextDemo() {
  return (
    <div className="demo">
      <PropDrillingDemo />
      <ThemeContextDemo />
      <AuthContextDemo />
    </div>
  );
}