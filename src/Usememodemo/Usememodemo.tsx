/**
 * useMemo — 3 real-world patterns + when NOT to use
 *
 * useMemo caches the result of a computation between renders.
 * Only recomputes when dependencies change.
 *
 *   const value = useMemo(() => expensiveCalc(a, b), [a, b]);
 *
 * When TO use:
 * - Expensive calculation (sorting, filtering large arrays, heavy math)
 * - Referential equality (object/array passed to React.memo child or useEffect dep)
 * - Derived state from props/state
 *
 * When NOT to use:
 * - Simple calculations (adding 2 numbers) — memo overhead > savings
 * - Every value by default — premature optimization
 *
 * Pattern 1 — Expensive filter+sort : search + sort large list
 * Pattern 2 — Derived stats         : computed totals from cart items
 * Pattern 3 — Referential equality  : stable object reference for useEffect dep
 */

import { useState, useMemo, useEffect, useRef } from "react";
import type { ChangeEvent } from "react";
import "./UseMemoDemo.css";

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 1 — Expensive filter + sort on large list
// ═══════════════════════════════════════════════════════════════════════════════

// Generate 2000 product items (simulates large dataset)
const ALL_PRODUCTS = Array.from({ length: 2000 }, (_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  category: ["Electronics", "Clothing", "Books", "Food"][i % 4],
  price: Math.round(100 + Math.random() * 9900),
}));

type SortKey = "name" | "price";

function FilterSortDemo() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("name");
  const [unrelated, setUnrelated] = useState(0); // triggers re-render without affecting filter
  const withoutMemoRef = useRef(0);
  const withMemoRef = useRef(0);

  // WITHOUT memo — runs every render (including unrelated state changes)
  const startWithout = performance.now();
  withoutMemoRef.current =
    Math.round(performance.now() - startWithout * 100) / 100;

  // WITH memo — only recomputes when search or sort changes
  const startWith = performance.now();
  const filteredWith = useMemo(() => {
    return ALL_PRODUCTS.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()),
    )
      .sort((a, b) => (a[sort] < b[sort] ? -1 : 1))
      .slice(0, 20);
  }, [search, sort]);
  withMemoRef.current = Math.round(performance.now() - startWith * 100) / 100;

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 1</p>
      <p className="demo__title">Expensive filter+sort — 2000 items</p>

      <input
        className="field-input"
        placeholder="Search products..."
        value={search}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setSearch(e.target.value)
        }
      />

      <div className="btn-row">
        <button
          className={`btn ${sort === "name" ? "btn--primary" : "btn--ghost"}`}
          onClick={() => setSort("name")}
        >
          Sort: Name
        </button>
        <button
          className={`btn ${sort === "price" ? "btn--primary" : "btn--ghost"}`}
          onClick={() => setSort("price")}
        >
          Sort: Price
        </button>
        <button
          className="btn btn--ghost"
          onClick={() => setUnrelated((p) => p + 1)}
        >
          Unrelated render ({unrelated})
        </button>
      </div>

      <div className="perf-row">
        <span className="perf-badge perf-badge--slow">
          Without memo: recalculates every render
        </span>
        <span className="perf-badge perf-badge--fast">
          With memo: skips on unrelated renders ✓
        </span>
      </div>

      <div className="item-list">
        {filteredWith.map((p) => (
          <div key={p.id} className="item-row">
            <span>
              {p.name}{" "}
              <span style={{ fontSize: 11, color: "#9ca3af" }}>
                ({p.category})
              </span>
            </span>
            <span className="item-row__price">₹{p.price}</span>
          </div>
        ))}
      </div>

      <p className="demo__note">
        Clicking the <strong>"Unrelated render"</strong> button updates only the{" "}
        <code>unrelated</code> state, while the <code>search</code> and{" "}
        <code>sort</code> values remain unchanged. Because{" "}
        <code>filteredWith</code> is memoized with <code>useMemo</code>, React
        reuses the cached result instead of recalculating the filtered list.
        Since the dependencies (<code>search</code> and <code>sort</code>) have
        not changed, no unnecessary filtering or sorting work is performed.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 2 — Derived stats from cart
// ═══════════════════════════════════════════════════════════════════════════════

interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
}

const INITIAL_CART: CartItem[] = [
  { id: 1, name: "React T-Shirt", price: 499, qty: 2 },
  { id: 2, name: "TypeScript Mug", price: 299, qty: 1 },
  { id: 3, name: "VS Code Sticker", price: 99, qty: 3 },
];

function CartStatsDemo() {
  const [cart, setCart] = useState<CartItem[]>(INITIAL_CART);

  // Derived stats — recompute only when cart changes
  const stats = useMemo(() => {
    const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    const itemCount = cart.reduce((sum, i) => sum + i.qty, 0);
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + tax;
    return { subtotal, itemCount, tax, total };
  }, [cart]);

  function updateQty(id: number, delta: number) {
    setCart((prev) =>
      prev
        .map((i) =>
          i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i,
        )
        .filter((i) => i.qty > 0),
    );
  }

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 2</p>
      <p className="demo__title">Derived stats — memoized cart totals</p>

      <div className="item-list">
        {cart.map((item) => (
          <div key={item.id} className="item-row">
            <span>{item.name}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                className="btn btn--ghost"
                style={{ height: 26, width: 26, padding: 0 }}
                onClick={() => updateQty(item.id, -1)}
              >
                −
              </button>
              <span
                style={{ minWidth: 20, textAlign: "center", fontWeight: 600 }}
              >
                {item.qty}
              </span>
              <button
                className="btn btn--ghost"
                style={{ height: 26, width: 26, padding: 0 }}
                onClick={() => updateQty(item.id, 1)}
              >
                +
              </button>
              <span className="item-row__price">₹{item.price * item.qty}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="stats-grid">
        <div className="stat-box">
          <p className="stat-box__value">{stats.itemCount}</p>
          <p className="stat-box__label">Items</p>
        </div>
        <div className="stat-box">
          <p className="stat-box__value">₹{stats.tax}</p>
          <p className="stat-box__label">GST 18%</p>
        </div>
        <div className="stat-box" style={{ background: "#ede9fe" }}>
          <p className="stat-box__value" style={{ color: "#5b21b6" }}>
            ₹{stats.total}
          </p>
          <p className="stat-box__label">Total</p>
        </div>
      </div>

      <p className="demo__note">
        <code>stats</code> computes <code>subtotal</code>, <code>tax</code>,{" "}
        <code>total</code>, and <code>itemCount</code> together inside a single{" "}
        <code>useMemo</code>. These values are recalculated only when the cart
        changes. During unrelated re-renders, React reuses the memoized result,
        avoiding unnecessary computations and improving performance.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 3 — Referential equality for useEffect dep
// ═══════════════════════════════════════════════════════════════════════════════

function ReferentialEqualityDemo() {
  const [userId, setUserId] = useState(1);
  const [theme, setTheme] = useState("light");
  const [fetchCount, setFetchCount] = useState(0);

  // WITHOUT memo — new object every render → useEffect runs on EVERY render
  // WITH memo — same reference unless userId changes → useEffect runs only when needed
  const configWith = useMemo(
    () => ({ userId, endpoint: "/api/user" }),
    [userId],
  );

  // This effect should only run when userId changes — not when theme changes
  useEffect(() => {
    setFetchCount((p) => p + 1);
    // In real app: fetch(configWith.endpoint + configWith.userId)
  }, [configWith]); // stable reference → doesn't fire on theme change

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 3</p>
      <p className="demo__title">
        Referential equality — stable object for useEffect dep
      </p>

      <div className="compare">
        <div className="compare__cell compare__cell--header">
          Without useMemo
        </div>
        <div className="compare__cell compare__cell--header">With useMemo</div>
        <div className="compare__cell compare__cell--bad">
          New object reference every render → useEffect fires every render
        </div>
        <div className="compare__cell compare__cell--good">
          Same reference unless userId changes → useEffect fires only when
          needed ✓
        </div>
      </div>

      <div className="btn-row">
        <button
          className="btn btn--primary"
          onClick={() => setUserId((p) => p + 1)}
        >
          Change User (id: {userId})
        </button>
        <button
          className="btn btn--ghost"
          onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
        >
          Toggle Theme ({theme})
        </button>
      </div>

      <div
        className="perf-badge perf-badge--calc"
        style={{ alignSelf: "flex-start" }}
      >
        API fetch count: {fetchCount} — only increments on user change ✓
      </div>

      <p className="demo__note">
        <code>{`{ userId, endpoint: "/api/user" }`}</code> is an object literal,
        and in JavaScript a new object reference is created on every render (
        <code>!==</code>). Without <code>useMemo</code>, this object appears to
        have changed on every render, causing <code>useEffect</code> to run
        again even when only unrelated state, such as the theme, changes. This
        can result in unnecessary API requests.
      </p>

      <p className="demo__warning">
        ⚠️{" "}
        <strong>
          Avoid overusing <code>useMemo</code>.
        </strong>{" "}
        There is no benefit in memoizing simple primitive values such as{" "}
        <code>string</code> or <code>number</code>. Use <code>useMemo</code>{" "}
        primarily for objects and arrays whose reference stability matters—for
        example, when they are dependencies of a <code>useEffect</code> or are
        passed as props to a <code>React.memo</code>-wrapped component.
      </p>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function UseMemoDemo() {
  return (
    <div className="demo">
      <FilterSortDemo />
      <CartStatsDemo />
      <ReferentialEqualityDemo />
    </div>
  );
}
