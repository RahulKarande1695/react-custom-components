/**
 * Autocomplete — Google-style search with inline + dropdown suggestions
 *
 * Behavior:
 * - Exact single match → inline autocomplete (input value completed in place)
 * - Multiple matches  → dropdown with history + suggestions sections
 * - Keyboard nav: ArrowUp/Down to move, Enter to select, Escape to close
 * - History: last 5 searches saved in localStorage
 * - Accessible: aria-autocomplete, aria-expanded, aria-activedescendant, role="listbox"
 */

import { useState, useRef, useEffect, useCallback } from "react";
import type { KeyboardEvent, ChangeEvent } from "react";
import "./Autocomplete.css";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Suggestion {
  id: string;
  text: string;
  type: "history" | "suggestion";
}

interface AutocompleteProps {
  // Fetch suggestions from API or static list
  fetchSuggestions: (query: string) => Promise<string[]>;
  onSearch: (query: string) => void;
  placeholder?: string;
  historyKey?: string;   // localStorage key for history
  maxHistory?: number;
}

// ─── History helpers ──────────────────────────────────────────────────────────

function loadHistory(key: string, max: number): string[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as string[]).slice(0, max) : [];
  } catch {
    return [];
  }
}

function saveHistory(key: string, query: string, max: number): void {
  try {
    const prev = loadHistory(key, max);
    // Move to top if already exists, otherwise prepend
    const next = [query, ...prev.filter((h) => h !== query)].slice(0, max);
    localStorage.setItem(key, JSON.stringify(next));
  } catch {}
}

// ─── Highlight matching text ──────────────────────────────────────────────────
// Wraps matched query part in <mark> for bold highlight

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query) return <span>{text}</span>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <span>{text}</span>;

  return (
    <span>
      {text.slice(0, idx)}
      <mark>{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </span>
  );
}

// ─── Autocomplete ─────────────────────────────────────────────────────────────

export function Autocomplete({
  fetchSuggestions,
  onSearch,
  placeholder = "Search...",
  historyKey = "autocomplete_history",
  maxHistory = 5,
}: AutocompleteProps) {
  const [query, setQuery]               = useState("");
  const [inlineHint, setInlineHint]     = useState(""); // ghost text after cursor
  const [suggestions, setSuggestions]   = useState<Suggestion[]>([]);
  const [open, setOpen]                 = useState(false);
  const [activeIdx, setActiveIdx]       = useState(-1);

  const inputRef    = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Build suggestion list from history + API results ──
  const buildSuggestions = useCallback(
    async (q: string) => {
      const history = loadHistory(historyKey, maxHistory)
        .filter((h) => h.toLowerCase().startsWith(q.toLowerCase()) && h !== q)
        .map((h, i): Suggestion => ({ id: `history-${i}`, text: h, type: "history" }));

      try {
        const api = await fetchSuggestions(q);
        const apiSuggestions: Suggestion[] = api
          .filter((s) => !history.some((h) => h.text === s)) // dedup with history
          .slice(0, 6)
          .map((s, i): Suggestion => ({ id: `suggestion-${i}`, text: s, type: "suggestion" }));

        const all = [...history, ...apiSuggestions];

        // Single exact-prefix match → inline autocomplete, no dropdown
        if (all.length === 1 && all[0].text.toLowerCase().startsWith(q.toLowerCase())) {
          setInlineHint(all[0].text.slice(q.length));
          setSuggestions([]);
          setOpen(false);
        } else {
          setInlineHint("");
          setSuggestions(all);
          setOpen(all.length > 0);
        }
      } finally {
        console.log("Autom compelete finally")
      }
    },
    [fetchSuggestions, historyKey, maxHistory]
  );

  // ── Debounced fetch on query change ──
  useEffect(() => {
    setActiveIdx(-1);

    if (!query.trim()) {
      setInlineHint("");
      setSuggestions([]);
      setOpen(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => buildSuggestions(query), 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, buildSuggestions]);

  // ── Close dropdown on outside click ──
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
        setInlineHint("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Commit search ──
  function commitSearch(text: string) {
    saveHistory(historyKey, text, maxHistory);
    setQuery(text);
    setInlineHint("");
    setSuggestions([]);
    setOpen(false);
    onSearch(text);
    inputRef.current?.blur();
  }

  // ── Input change ──
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setInlineHint("");
  }

  // ── Keyboard navigation ──
  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    // Tab/ArrowRight: accept inline hint
    if ((e.key === "Tab" || e.key === "ArrowRight") && inlineHint) {
      e.preventDefault();
      const completed = query + inlineHint;
      setQuery(completed);
      setInlineHint("");
      return;
    }

    if (e.key === "Escape") {
      setOpen(false);
      setInlineHint("");
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && suggestions[activeIdx]) {
        commitSearch(suggestions[activeIdx].text);
      } else if (query.trim()) {
        commitSearch(query.trim());
      }
      return;
    }

    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((prev) => Math.max(prev - 1, -1));
    }
  }

  const historySuggestions    = suggestions.filter((s) => s.type === "history");
  const apiSuggestions        = suggestions.filter((s) => s.type === "suggestion");

  return (
    <div className="autocomplete">
      {/* Input */}
      <div className="autocomplete__input-wrap">
        <span className="autocomplete__search-icon" aria-hidden>🔍</span>

        {/* Overlay: input on top (z-index:1), ghost div behind (z-index:0)
             Ghost has two spans — typed part (transparent) + hint part (blue)
             This makes cursor sit right after typed text, hint appears after */}
        <div className="autocomplete__input-overlay">
          {inlineHint && (
            <div className="autocomplete__ghost" aria-hidden>
              <span className="autocomplete__ghost-typed">{query}</span>
              <span className="autocomplete__ghost-hint">{inlineHint}</span>
            </div>
          )}
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-activedescendant={activeIdx >= 0 ? suggestions[activeIdx]?.id : undefined}
            aria-label={placeholder}
            className="autocomplete__input"
            value={query}
            placeholder={placeholder}
            autoComplete="off"
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => query && suggestions.length > 0 && setOpen(true)}
          />
        </div>

        {(query || inlineHint) && (
          <button
            type="button"
            className="autocomplete__clear-btn"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              setInlineHint("");
              setSuggestions([]);
              setOpen(false);
              inputRef.current?.focus();
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          role="listbox"
          aria-label="Suggestions"
          className="autocomplete__dropdown"
        >
          {/* History section */}
          {historySuggestions.length > 0 && (
            <>
              <div className="autocomplete__section-label">Recent</div>
              {historySuggestions.map((s, idx) => (
                <div
                  key={s.id}
                  id={s.id}
                  role="option"
                  aria-selected={activeIdx === idx}
                  className={`autocomplete__option${activeIdx === idx ? " autocomplete__option--active" : ""}`}
                  onMouseEnter={() => setActiveIdx(idx)}
                  onMouseDown={() => commitSearch(s.text)}
                >
                  <span className="autocomplete__option-icon" aria-hidden>🕐</span>
                  <span className="autocomplete__option-text">
                    <HighlightedText text={s.text} query={query} />
                  </span>
                  <span className="autocomplete__option-action" aria-hidden>↗</span>
                </div>
              ))}
            </>
          )}

          {/* Divider between sections */}
          {historySuggestions.length > 0 && apiSuggestions.length > 0 && (
            <div className="autocomplete__divider" />
          )}

          {/* API suggestions section */}
          {apiSuggestions.length > 0 && (
            <>
              <div className="autocomplete__section-label">Suggestions</div>
              {apiSuggestions.map((s, idx) => {
                const globalIdx = historySuggestions.length + idx;
                return (
                  <div
                    key={s.id}
                    id={s.id}
                    role="option"
                    aria-selected={activeIdx === globalIdx}
                    className={`autocomplete__option${activeIdx === globalIdx ? " autocomplete__option--active" : ""}`}
                    onMouseEnter={() => setActiveIdx(globalIdx)}
                    onMouseDown={() => commitSearch(s.text)}
                  >
                    <span className="autocomplete__option-icon" aria-hidden>🔍</span>
                    <span className="autocomplete__option-text">
                      <HighlightedText text={s.text} query={query} />
                    </span>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Autocomplete;