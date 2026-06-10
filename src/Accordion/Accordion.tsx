import { useState, useContext, createContext } from "react";
import type { ReactNode } from "react";
import "./Accordion.css";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AccordionContextValue {
  openIds: Set<string>;
  toggle: (id: string) => void;
}

interface ItemContextValue {
  id: string;
  isOpen: boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AccordionContext = createContext<AccordionContextValue | null>(null);
const ItemContext = createContext<ItemContextValue | null>(null);

function useAccordion(name: string): AccordionContextValue {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error(`<${name}> must be used inside <Accordion>`);
  return ctx;
}

function useItem(name: string): ItemContextValue {
  const ctx = useContext(ItemContext);
  if (!ctx) throw new Error(`<${name}> must be used inside <Accordion.Item>`);
  return ctx;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Item({ id, children }: { id: string; children: ReactNode }) {
  const { openIds } = useAccordion("Accordion.Item");
  const isOpen = openIds.has(id);

  return (
    // ItemContext provides id and open state to Trigger and Panel below
    <ItemContext.Provider value={{ id, isOpen }}>
      <div className="accordion__item">{children}</div>
    </ItemContext.Provider>
  );
}

function Trigger({ children }: { children: ReactNode }) {
  const { toggle } = useAccordion("Accordion.Trigger");
  const { id, isOpen } = useItem("Accordion.Trigger");

  return (
    <h3 style={{ margin: 0 }}>
      {/* button inside h3: screen reader announces heading level + expanded state */}
      <button
        type="button"
        id={`trigger-${id}`}
        aria-expanded={isOpen}
        aria-controls={`panel-${id}`}
        className="accordion__trigger"
        onClick={() => toggle(id)}
      >
        {children}
        <span className={`accordion__icon${isOpen ? " accordion__icon--open" : ""}`} aria-hidden>
          ▼
        </span>
      </button>
    </h3>
  );
}

function Panel({ children }: { children: ReactNode }) {
  const { id, isOpen } = useItem("Accordion.Panel");

  return (
    // role="region" + aria-labelledby links panel to its trigger for screen readers
    <div
      id={`panel-${id}`}
      role="region"
      aria-labelledby={`trigger-${id}`}
      className={`accordion__panel${isOpen ? " accordion__panel--open" : ""}`}
    >
      {/* Inner div with overflow:hidden is required for the grid height trick */}
      <div className="accordion__panel-inner">
        <div className="accordion__content">{children}</div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

interface AccordionProps {
  children: ReactNode;
  defaultOpen?: string | string[];  // pre-opened item id(s)
  multiple?: boolean;               // allow multiple open at once
}

export default function Accordion({
  children,
  defaultOpen,
  multiple = false,
}: AccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(() => {
    if (!defaultOpen) return new Set();
    return new Set(Array.isArray(defaultOpen) ? defaultOpen : [defaultOpen]);
  });

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        // single mode: clear all before opening new
        if (!multiple) next.clear();
        next.add(id);
      }
      return next;
    });
  }

  return (
    <AccordionContext.Provider value={{ openIds, toggle }}>
      <div className="accordion">{children}</div>
    </AccordionContext.Provider>
  );
}

Accordion.Item    = Item;
Accordion.Trigger = Trigger;
Accordion.Panel   = Panel;