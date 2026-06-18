/**
 * Breadcrumb — Compound Component Pattern
 *
 * Pattern: Compound Components + Context
 *
 * Why compound?
 * - Consumer composes items declaratively — no items[] array prop
 * - Context tracks total item count + index for separator logic
 *   (separator shows between items, not after last)
 * - `maxItems` collapses middle items into "..." automatically
 *
 * Usage:
 *   <Breadcrumb maxItems={4}>
 *     <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
 *     <Breadcrumb.Item href="/products">Products</Breadcrumb.Item>
 *     <Breadcrumb.Item>Shoes</Breadcrumb.Item>
 *   </Breadcrumb>
 */

import { useState, useContext, createContext, Children, isValidElement } from "react";
import type { ReactNode } from "react";
import "./Breadcrumb.css";

// ─── Context ──────────────────────────────────────────────────────────────────

interface BreadcrumbContextValue {
  separator: ReactNode;
  visibleIndices: Set<number>;   // which item indices are visible (not collapsed)
  total: number;
}

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);

function useBreadcrumb(name: string): BreadcrumbContextValue {
  const ctx = useContext(BreadcrumbContext);
  if (!ctx) throw new Error(`<${name}> must be used inside <Breadcrumb>`);
  return ctx;
}

// ─── Breadcrumb.Item ──────────────────────────────────────────────────────────

interface ItemProps {
  href?: string;
  children: ReactNode;
  index?: number;       // injected by root via React.Children.map
}

function Item({ href, children, index = 0 }: ItemProps) {
  const { separator, visibleIndices, total } = useBreadcrumb("Breadcrumb.Item");

  // If this index is collapsed, render nothing
  if (!visibleIndices.has(index)) return null;

  const isLast = index === total - 1;

  return (
    <li className="breadcrumb__item">
      {/* Separator before every item except first visible */}
      {index > 0 && visibleIndices.has(index) && (
        <span className="breadcrumb__separator" aria-hidden>
          {separator}
        </span>
      )}

      {isLast || !href ? (
        // Last item — current page, no link
        <span
          className="breadcrumb__current"
          aria-current="page"
        >
          {children}
        </span>
      ) : (
        <a href={href} className="breadcrumb__link">
          {children}
        </a>
      )}
    </li>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

interface BreadcrumbProps {
  children: ReactNode;
  separator?: ReactNode;
  maxItems?: number;       // collapse middle items if total exceeds this
}

export function Breadcrumb({
  children,
  separator = "/",
  maxItems,
}: BreadcrumbProps) {
  const [expanded, setExpanded] = useState(false);

  const items = Children.toArray(children).filter(isValidElement);
  const total = items.length;

  // Decide which indices to show
  // Always show first + last, collapse middle when > maxItems
  function buildVisibleIndices(): Set<number> {
    if (!maxItems || expanded || total <= maxItems) {
      return new Set(Array.from({ length: total }, (_, i) => i));
    }
    // Show first, last — rest collapsed
    return new Set([0, total - 1]);
  }

  const visibleIndices = buildVisibleIndices();
  const isCollapsed    = !expanded && maxItems && total > maxItems;

  return (
    <BreadcrumbContext.Provider value={{ separator, visibleIndices, total }}>
      <nav aria-label="Breadcrumb">
        <ol className="breadcrumb">
          {items.map((child, idx) => {
            // Inject index prop into each Item
            const item = child as React.ReactElement<ItemProps>;

            // After first item, inject ellipsis button before collapsed middle
            if (isCollapsed && idx === 1) {
              return (
                <>
                  {/* separator before ellipsis */}
                  <li key="ellipsis" className="breadcrumb__item">
                    <span className="breadcrumb__separator" aria-hidden>
                      {separator}
                    </span>
                    <button
                      type="button"
                      className="breadcrumb__ellipsis"
                      aria-label="Show full path"
                      onClick={() => setExpanded(true)}
                    >
                      •••
                    </button>
                  </li>
                  {/* render last item with separator */}
                  {idx === total - 2
                    ? null
                    : null}
                </>
              );
            }

            // Skip middle items when collapsed
            if (isCollapsed && idx > 0 && idx < total - 1) {
              return null;
            }

            return (
              // cloneElement to pass index without exposing it in public API
              // eslint-disable-next-line react/no-clone-element
              <item.type key={idx} {...item.props} index={idx} />
            );
          })}
        </ol>
      </nav>
    </BreadcrumbContext.Provider>
  );
}

Breadcrumb.Item = Item;