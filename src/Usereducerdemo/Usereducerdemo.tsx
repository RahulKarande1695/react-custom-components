/**
 * useReducer — 3 real-world usage patterns
 *
 * When to use useReducer over useState:
 * - Multiple related state fields update together
 * - Next state depends on previous state in complex ways
 * - State transitions have clear names (actions)
 * - Easy to test — reducer is a pure function
 *
 * Pattern:
 *   const [state, dispatch] = useReducer(reducer, initialState)
 *   reducer(state, action) => newState   — pure function, no side effects
 *   dispatch({ type: "ACTION", payload }) — triggers reducer
 *
 * 1. Counter with history  — multiple fields (count + log) update together
 * 2. Form with validation  — complex state (fields + errors + status)
 * 3. Shopping cart         — array manipulation via named actions
 */

import { useReducer } from "react";
import type { ChangeEvent, FormEvent } from "react";
import "./UseReducerDemo.css";

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Counter with action log
// ═══════════════════════════════════════════════════════════════════════════════

interface CounterState {
  count: number;
  log: string[];   // history of actions
}

type CounterAction =
  | { type: "INCREMENT" }
  | { type: "DECREMENT" }
  | { type: "RESET" }
  | { type: "INCREMENT_BY"; payload: number };

const counterInitial: CounterState = { count: 0, log: [] };

// Pure function — same input always gives same output, no side effects
function counterReducer(state: CounterState, action: CounterAction): CounterState {
  switch (action.type) {
    case "INCREMENT":
      return { count: state.count + 1, log: [`+1 → ${state.count + 1}`, ...state.log] };
    case "DECREMENT":
      return { count: state.count - 1, log: [`-1 → ${state.count - 1}`, ...state.log] };
    case "RESET":
      return { count: 0, log: ["Reset → 0", ...state.log] };
    case "INCREMENT_BY":
      return {
        count: state.count + action.payload,
        log: [`+${action.payload} → ${state.count + action.payload}`, ...state.log],
      };
    default:
      // TypeScript exhaustive check — if new action added without case, compile error
      return state;
  }
}

function CounterDemo() {
  const [state, dispatch] = useReducer(counterReducer, counterInitial);

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 1</p>
      <p className="demo__title">Counter with action log — multiple fields</p>

      <div className="counter">
        <button className="counter__btn" onClick={() => dispatch({ type: "DECREMENT" })}>−</button>
        <span className="counter__value">{state.count}</span>
        <button className="counter__btn" onClick={() => dispatch({ type: "INCREMENT" })}>+</button>
        <button className="counter__btn" style={{ width: "auto", padding: "0 10px", fontSize: 13 }}
          onClick={() => dispatch({ type: "INCREMENT_BY", payload: 5 })}>
          +5
        </button>
        <button className="counter__reset" onClick={() => dispatch({ type: "RESET" })}>Reset</button>
      </div>

      {/* Action log — shows every dispatch */}
      <div className="action-log">
        {state.log.slice(0, 5).map((entry, i) => (
          <div key={i} className={`action-log__entry${i === 0 ? " action-log__entry--latest" : ""}`}>
            {entry}
          </div>
        ))}
      </div>

      <p className="demo__note">
        <code>count</code> आणि <code>log</code> — दोन्ही एकाच dispatch मध्ये update होतात.
        useState असतं तर 2 separate setState calls लागले असते — race condition शक्य होती.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Form with validation
// ═══════════════════════════════════════════════════════════════════════════════

interface FormFields {
  name: string;
  email: string;
}

interface FormState {
  fields: FormFields;
  errors: Partial<FormFields>;
  status: "idle" | "submitting" | "success";
}

type FormAction =
  | { type: "SET_FIELD"; payload: { name: keyof FormFields; value: string } }
  | { type: "SET_ERRORS"; payload: Partial<FormFields> }
  | { type: "SUBMIT" }
  | { type: "SUCCESS" }
  | { type: "RESET" };

const formInitial: FormState = {
  fields: { name: "", email: "" },
  errors: {},
  status: "idle",
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        fields: { ...state.fields, [action.payload.name]: action.payload.value },
        // Clear error for this field when user types
        errors: { ...state.errors, [action.payload.name]: undefined },
      };
    case "SET_ERRORS":
      return { ...state, errors: action.payload };
    case "SUBMIT":
      return { ...state, status: "submitting" };
    case "SUCCESS":
      return { ...state, status: "success" };
    case "RESET":
      return formInitial;
    default:
      return state;
  }
}

function validate(fields: FormFields): Partial<FormFields> {
  const errors: Partial<FormFields> = {};
  if (!fields.name.trim()) errors.name = "Name is required.";
  if (!fields.email.trim()) errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
    errors.email = "Enter a valid email.";
  return errors;
}

function FormDemo() {
  const [state, dispatch] = useReducer(formReducer, formInitial);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    dispatch({
      type: "SET_FIELD",
      payload: { name: e.target.name as keyof FormFields, value: e.target.value },
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errors = validate(state.fields);
    if (Object.keys(errors).length) {
      dispatch({ type: "SET_ERRORS", payload: errors });
      return;
    }
    dispatch({ type: "SUBMIT" });
    // Simulate async submit
    setTimeout(() => dispatch({ type: "SUCCESS" }), 1000);
  }

  if (state.status === "success") {
    return (
      <div className="demo__section">
        <p className="demo__label">Pattern 2</p>
        <p className="demo__title">Form with validation</p>
        <p className="form-success">✓ Submitted as {state.fields.name}!</p>
        <div className="form-btn-row">
          <button className="form-btn form-btn--ghost" onClick={() => dispatch({ type: "RESET" })}>
            Reset
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 2</p>
      <p className="demo__title">Form with validation — fields + errors + status</p>

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="form-row">
            <label className="form-row__label" htmlFor="r-name">Name</label>
            <input
              id="r-name"
              name="name"
              className={`form-row__input${state.errors.name ? " form-row__input--error" : ""}`}
              value={state.fields.name}
              onChange={handleChange}
              placeholder="Rahul"
              aria-invalid={!!state.errors.name}
            />
            {state.errors.name && <p className="form-row__error">{state.errors.name}</p>}
          </div>

          <div className="form-row">
            <label className="form-row__label" htmlFor="r-email">Email</label>
            <input
              id="r-email"
              name="email"
              type="email"
              className={`form-row__input${state.errors.email ? " form-row__input--error" : ""}`}
              value={state.fields.email}
              onChange={handleChange}
              placeholder="rahul@example.com"
              aria-invalid={!!state.errors.email}
            />
            {state.errors.email && <p className="form-row__error">{state.errors.email}</p>}
          </div>

          <div className="form-btn-row">
            <button
              type="submit"
              className="form-btn form-btn--primary"
              disabled={state.status === "submitting"}
            >
              {state.status === "submitting" ? "Submitting..." : "Submit"}
            </button>
            <button
              type="button"
              className="form-btn form-btn--ghost"
              onClick={() => dispatch({ type: "RESET" })}
            >
              Reset
            </button>
          </div>
        </div>
      </form>

      <p className="demo__note">
        fields, errors, status — तीन related pieces एकाच <code>state</code> object मध्ये.
        <code>SET_FIELD</code> dispatch करताना त्या field चा error पण clear होतो — atomic update.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Shopping cart
// ═══════════════════════════════════════════════════════════════════════════════

interface Product {
  id: string;
  name: string;
  price: number;
}

interface CartItem extends Product {
  qty: number;
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Product }
  | { type: "REMOVE_ITEM"; payload: string }   // id
  | { type: "INCREMENT_QTY"; payload: string }
  | { type: "CLEAR" };

const PRODUCTS: Product[] = [
  { id: "p1", name: "React T-Shirt",    price: 499 },
  { id: "p2", name: "TypeScript Mug",   price: 299 },
  { id: "p3", name: "VS Code Sticker",  price: 99  },
];

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const exists = state.items.find((i) => i.id === action.payload.id);
      if (exists) {
        // Already in cart — increment qty
        return {
          items: state.items.map((i) =>
            i.id === action.payload.id ? { ...i, qty: i.qty + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { ...action.payload, qty: 1 }] };
    }
    case "REMOVE_ITEM":
      return { items: state.items.filter((i) => i.id !== action.payload) };
    case "INCREMENT_QTY":
      return {
        items: state.items.map((i) =>
          i.id === action.payload ? { ...i, qty: i.qty + 1 } : i
        ),
      };
    case "CLEAR":
      return { items: [] };
    default:
      return state;
  }
}

function CartDemo() {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const total = state.items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 3</p>
      <p className="demo__title">Shopping cart — array via named actions</p>

      <div className="product-list">
        {PRODUCTS.map((p) => (
          <div key={p.id} className="product-item">
            <span className="product-item__name">{p.name}</span>
            <span className="product-item__price">₹{p.price}</span>
            <button
              className="product-item__btn"
              onClick={() => dispatch({ type: "ADD_ITEM", payload: p })}
            >
              Add
            </button>
          </div>
        ))}
      </div>

      {state.items.length > 0 && (
        <div className="cart-summary">
          {state.items.map((item) => (
            <div key={item.id} className="cart-item-row">
              <span>{item.name} × {item.qty}</span>
              <span>₹{item.price * item.qty}</span>
              <button
                className="cart-remove-btn"
                onClick={() => dispatch({ type: "REMOVE_ITEM", payload: item.id })}
              >
                Remove
              </button>
            </div>
          ))}
          <div className="cart-row cart-row--total">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
          <button
            className="form-btn form-btn--ghost"
            style={{ alignSelf: "flex-start" }}
            onClick={() => dispatch({ type: "CLEAR" })}
          >
            Clear cart
          </button>
        </div>
      )}

      <p className="demo__note">
        <code>ADD_ITEM</code> — already exists तर qty increment, otherwise new item push.
        हे logic useState मध्ये component मध्ये लिहायला लागलं असतं — reducer मध्ये isolated आणि testable आहे.
      </p>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function UseReducerDemo() {
  return (
    <div className="demo">
      <CounterDemo />
      <FormDemo />
      <CartDemo />
    </div>
  );
}