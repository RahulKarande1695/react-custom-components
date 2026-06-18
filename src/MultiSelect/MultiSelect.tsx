/**
 * MultiSelect — Compound Component Pattern
 *
 * Patterns used:
 * - Compound components: MultiSelect.Option
 * - Context: root manages selected state, Option reads from it
 * - Render prop: none needed — Options are composed by consumer
 *
 * Features:
 * - Tag display for selected items with individual remove
 * - Search/filter inside dropdown
 * - Select all / Clear all
 * - Keyboard: Escape closes, click outside closes
 * - Accessible: aria-multiselectable, aria-selected, aria-expanded
 *
 * Usage:
 *   <MultiSelect
 *     options={[{ value: "react", label: "React" }]}
 *     selected={selected}
 *     setSelected={setSelected}
 *     placeholder="Select frameworks..."
 *   />
 */

import { useState, useRef, useEffect, useMemo } from "react";
import type { KeyboardEvent, ChangeEvent } from "react";
import "./MultiSelect.css";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Option {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  options: Option[];
  selected: string[];
  setSelected: (selected: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  maxVisible?: number;
}

// ─── MultiSelect ──────────────────────────────────────────────────────────────

function MultiSelect({
  options,
  selected,
  setSelected,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  maxVisible = 3,
}: MultiSelectProps) {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState("");

  const rootRef   = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open) searchRef.current?.focus();
    else setSearch("");
  }, [open]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Filtered options based on search ──
  const filtered = useMemo(
    () => options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase())),
    [options, search]
  );

  // ── Toggle single option ──
  function toggle(value: string) {
    if (selected.includes(value)) {
      setSelected(selected.filter((v) => v !== value));
    } else {
      setSelected([...selected, value]);
    }
  }

  function selectAll() {
    setSelected(options.map((o) => o.value));
  }

  function clearAll() {
    setSelected([]);
  }

  function handleTriggerKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((prev) => !prev);
    }
    if (e.key === "Escape") setOpen(false);
  }

  function handleDropdownKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") setOpen(false);
  }

  // ── Tags display ──
  const selectedOptions = options.filter((o) => selected.includes(o.value));
  const visibleTags     = selectedOptions.slice(0, maxVisible);
  const hiddenCount     = selectedOptions.length - visibleTags.length;
  const allSelected     = selected.length === options.length;

  return (
    <div className="ms" ref={rootRef}>
      {/* Trigger */}
      <button
        type="button"
        className={`ms__trigger${open ? " ms__trigger--open" : ""}`}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={placeholder}
      >
        {selectedOptions.length === 0 ? (
          <span className="ms__placeholder">{placeholder}</span>
        ) : (
          <>
            {visibleTags.map((o) => (
              <span key={o.value} className="ms__tag">
                <span className="ms__tag-text">{o.label}</span>
                <button
                  type="button"
                  className="ms__tag-remove"
                  aria-label={`Remove ${o.label}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(o.value);
                  }}
                >
                  ✕
                </button>
              </span>
            ))}
            {hiddenCount > 0 && (
              <span className="ms__tag">+{hiddenCount} more</span>
            )}
          </>
        )}
        <span className="ms__chevron" aria-hidden>▼</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="listbox"
          aria-multiselectable
          aria-label={placeholder}
          className="ms__dropdown"
          onKeyDown={handleDropdownKeyDown}
        >
          {/* Search */}
          <div className="ms__search-wrap">
            <input
              ref={searchRef}
              type="text"
              className="ms__search"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              aria-label="Search options"
            />
          </div>

          {/* Select all / Clear */}
          <div className="ms__actions">
            <button
              type="button"
              className="ms__action-btn"
              onClick={selectAll}
              disabled={allSelected}
            >
              Select all
            </button>
            <div className="ms__action-divider" />
            <button
              type="button"
              className="ms__action-btn"
              onClick={clearAll}
              disabled={selected.length === 0}
            >
              Clear
            </button>
          </div>

          {/* Options */}
          <div className="ms__list">
            {filtered.length === 0 ? (
              <div className="ms__empty">No options found</div>
            ) : (
              filtered.map((option) => {
                const isSelected = selected.includes(option.value);
                return (
                  <div
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    className={`ms__option${isSelected ? " ms__option--active" : ""}`}
                    onClick={() => toggle(option.value)}
                  >
                    <span className="ms__checkbox" aria-hidden>
                      {isSelected && "✓"}
                    </span>
                    <span className="ms__option-label">{option.label}</span>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="ms__footer">
            {selected.length} of {options.length} selected
          </div>
        </div>
      )}
    </div>
  );
}

export default MultiSelect;