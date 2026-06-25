/**
 * useActionState (React 19) — manage async action state + result
 *
 * Combines what used to take useState + useEffect + manual error handling
 * into one hook built specifically for form/async actions.
 *
 *   const [state, formAction, isPending] = useActionState(action, initialState);
 *
 *   action(previousState, formData) => newState   — runs on submit
 *   state      — current result (validation errors, success message, etc.)
 *   formAction — pass directly to <form action={formAction}>
 *   isPending  — true while action is running
 *
 * useActionState vs manual useState + async handler:
 * ┌────────────────────────┬───────────────────────┬───────────────────────┐
 * │                        │  Manual (useState)     │  useActionState        │
 * ├────────────────────────┼───────────────────────┼───────────────────────┤
 * │ Pending state          │ Manual isLoading state │ Built-in isPending     │
 * │ Previous state access  │ Manual ref/closure      │ Passed as 1st param   │
 * │ Works with <form action>│ No                     │ Yes — native integration│
 * │ Progressive enhancement│ No                     │ Yes (works without JS) │
 * └────────────────────────┴───────────────────────┴───────────────────────┘
 *
 * Pattern 1 — Login form with server validation : errors returned from action
 * Pattern 2 — Vote counter                       : previousState used to compute next
 */

import { useActionState } from "react";
import "./UseActionStateDemo.css";

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 1 — Login form with server-side validation
// ═══════════════════════════════════════════════════════════════════════════════

interface LoginState {
  success: boolean;
  errors: { email?: string; password?: string };
  message: string;
}

const initialLoginState: LoginState = {
  success: false,
  errors: {},
  message: "",
};

// The "action" — receives previous state + form data, returns new state
// In a real app this would call your backend API
async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  // Simulate server round-trip
  await new Promise((r) => setTimeout(r, 1000));

  const errors: LoginState["errors"] = {};
  if (!email.includes("@")) errors.email = "Enter a valid email";
  if (password.length < 6) errors.password = "Min 6 characters";

  if (Object.keys(errors).length > 0) {
    return { success: false, errors, message: "" };
  }

  // Simulate wrong credentials check
  if (password !== "secret123") {
    return { success: false, errors: {}, message: "Invalid email or password" };
  }

  return { success: true, errors: {}, message: "Logged in successfully!" };
}

function LoginFormDemo() {
  // state starts as initialLoginState, updates to whatever loginAction returns
  // isPending — true automatically while loginAction is running
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialLoginState,
  );

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 1</p>
      <p className="demo__title">
        Login form — server validation via action state
      </p>

      {state.success ? (
        <p className="success-msg">✓ {state.message}</p>
      ) : (
        <form
          action={formAction}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <div className="form-row">
            <label className="form-row__label" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              className={`field-input${state.errors.email ? " field-input--error" : ""}`}
              placeholder="rahul@example.com"
            />
            {state.errors.email && (
              <p className="form-row__error">{state.errors.email}</p>
            )}
          </div>

          <div className="form-row">
            <label className="form-row__label" htmlFor="login-password">
              Password{" "}
              <span style={{ color: "#9ca3af", fontWeight: 400 }}>
                (try "secret123")
              </span>
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              className={`field-input${state.errors.password ? " field-input--error" : ""}`}
              placeholder="••••••••"
            />
            {state.errors.password && (
              <p className="form-row__error">{state.errors.password}</p>
            )}
          </div>

          {state.message && <p className="server-error">{state.message}</p>}

          <button type="submit" className="submit-btn" disabled={isPending}>
            {isPending && <span className="spinner-sm" />}
            {isPending ? "Logging in..." : "Login"}
          </button>
        </form>
      )}

      <p className="demo__note">
        <code>loginAction(previousState, formData)</code> — server-side
        validation simulate, errors object return. <code>isPending</code>{" "}
        automatically track — manual <code>isLoading</code> no need of state.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 2 — Vote counter using previousState
// ═══════════════════════════════════════════════════════════════════════════════

interface VoteState {
  count: number;
  lastAction: "up" | "down" | null;
}

// Simulates a server call that increments/decrements — uses previousState
async function voteAction(
  previousState: VoteState,
  formData: FormData,
): Promise<VoteState> {
  const direction = String(formData.get("direction")) as "up" | "down";

  await new Promise((r) => setTimeout(r, 400)); // simulate network

  return {
    // previousState.count is the key part — action builds on it, not a fresh useState
    count: previousState.count + (direction === "up" ? 1 : -1),
    lastAction: direction,
  };
}

function VoteCounterDemo() {
  const [state, formAction, isPending] = useActionState(voteAction, {
    count: 42,
    lastAction: null,
  });

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 2</p>
      <p className="demo__title">
        Vote counter — action uses previousState directly
      </p>

      <div className="vote-row">
        <form action={formAction}>
          <input type="hidden" name="direction" value="down" />
          <button type="submit" className="vote-btn" disabled={isPending}>
            −
          </button>
        </form>

        <span className="vote-count">
          {isPending ? (
            <span
              className="spinner-sm"
              style={{
                borderTopColor: "#111827",
                borderColor: "rgba(0,0,0,0.15)",
              }}
            />
          ) : (
            state.count
          )}
        </span>

        <form action={formAction}>
          <input type="hidden" name="direction" value="up" />
          <button type="submit" className="vote-btn" disabled={isPending}>
            +
          </button>
        </form>
      </div>

      <div className="compare">
        <div className="compare__cell compare__cell--header">
          useState approach
        </div>
        <div className="compare__cell compare__cell--header">
          useActionState
        </div>
        <div className="compare__cell compare__cell--bad">
          Need separate isPending state + manual try/catch
        </div>
        <div className="compare__cell compare__cell--good">
          previousState passed automatically, isPending built-in ✓
        </div>
      </div>
      <p className="demo__note">
        <code>voteAction</code>'s first parameter, <code>previousState</code>,
        contains the result from the previous action call. You can use it
        directly to increment or decrement the count, so there's no need to
        maintain a separate state outside the action.
      </p>

      <p className="demo__warning">
        ⚠️ <strong>useActionState vs useOptimistic:</strong>{" "}
        <code>useActionState</code> is used to handle the final action result
        (such as success or error), whereas <code>useOptimistic</code> is used
        to provide an instant UI update while the action is still in progress.
        In many real-world applications, both are used together to deliver
        immediate feedback along with the final confirmed result.
      </p>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function UseActionStateDemo() {
  return (
    <div className="demo">
      <LoginFormDemo />
      <VoteCounterDemo />
    </div>
  );
}
