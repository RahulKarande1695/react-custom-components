/**
 * Todo App
 *
 * State shape — flat array, real-life standard:
 *   TodoItem[] — each item has id, text, done
 *
 * Features:
 * - Add, toggle, inline edit (double-click), delete
 * - Filter: All / Active / Done
 * - Clear completed
 * - localStorage persistence
 * - Accessible: aria-label, aria-live, role="list"
 */

import { useState, useRef, useEffect } from "react";
import type { KeyboardEvent, FormEvent, ChangeEvent } from "react";
import "./Todo.css";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TodoItem {
  id: string;
  text: string;
  done: boolean;
}

type Filter = "all" | "active" | "done";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

function load(): TodoItem[] {
  try {
    const raw = localStorage.getItem("todos");
    return raw ? (JSON.parse(raw) as TodoItem[]) : [];
  } catch {
    return [];
  }
}

function save(items: TodoItem[]): void {
  localStorage.setItem("todos", JSON.stringify(items));
}

// ─── TodoItem row ─────────────────────────────────────────────────────────────

interface RowProps {
  item: TodoItem;
  onToggle: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}

function TodoRow({ item, onToggle, onEdit, onDelete }: RowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.text);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when edit mode starts
  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function commitEdit() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== item.text) onEdit(item.id, trimmed);
    else setDraft(item.text); // revert if empty or unchanged
    setEditing(false);
  }

  function handleEditKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") { setDraft(item.text); setEditing(false); }
  }

  return (
    <li className="todo__item">
      <input
        type="checkbox"
        className="todo__checkbox"
        checked={item.done}
        onChange={() => onToggle(item.id)}
        aria-label={`Mark "${item.text}" as ${item.done ? "active" : "done"}`}
      />

      {editing ? (
        <input
          ref={inputRef}
          className="todo__edit-input"
          value={draft}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleEditKeyDown}
          aria-label="Edit todo"
        />
      ) : (
        <span
          className={`todo__label${item.done ? " todo__label--done" : ""}`}
          onDoubleClick={() => !item.done && setEditing(true)}
          title={item.done ? undefined : "Double-click to edit"}
        >
          {item.text}
        </span>
      )}

      <div className="todo__actions">
        {!item.done && !editing && (
          <button
            className="todo__icon-btn"
            onClick={() => setEditing(true)}
            aria-label={`Edit "${item.text}"`}
          >
            ✏️
          </button>
        )}
        <button
          className="todo__icon-btn todo__icon-btn--delete"
          onClick={() => onDelete(item.id)}
          aria-label={`Delete "${item.text}"`}
        >
          🗑
        </button>
      </div>
    </li>
  );
}

// ─── Todo App ─────────────────────────────────────────────────────────────────

export function TodoApp() {
  const [items, setItems] = useState<TodoItem[]>(load);
  const [input, setInput]   = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  // Persist on every change
  useEffect(() => { save(items); }, [items]);

  // ── Derived ──
  const filtered = items.filter((item) => {
    if (filter === "active") return !item.done;
    if (filter === "done")   return item.done;
    return true;
  });

  const remaining  = items.filter((i) => !i.done).length;
  const doneCount  = items.filter((i) => i.done).length;

  // ── Handlers ──
  function handleAdd(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setItems((prev) => [...prev, { id: uid(), text, done: false }]);
    setInput("");
  }

  function handleToggle(id: string) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i))
    );
  }

  function handleEdit(id: string, text: string) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, text } : i))
    );
  }

  function handleDelete(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function handleClearDone() {
    setItems((prev) => prev.filter((i) => !i.done));
  }

  const FILTERS: { label: string; value: Filter }[] = [
    { label: "All",    value: "all" },
    { label: "Active", value: "active" },
    { label: "Done",   value: "done" },
  ];

  return (
    <div className="todo">
      <div className="todo__card">

        {/* Header */}
        <div className="todo__header">
          <h1 className="todo__title">My tasks</h1>
          <span className="todo__count" aria-live="polite" aria-atomic>
            {remaining} left
          </span>
        </div>

        {/* Add form */}
        <form className="todo__form" onSubmit={handleAdd} noValidate>
          <input
            className="todo__input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a task..."
            aria-label="New task"
          />
          <button
            type="submit"
            className="todo__add-btn"
            disabled={!input.trim()}
            aria-label="Add task"
          >
            Add
          </button>
        </form>

        {/* Filters */}
        <div className="todo__filters" role="group" aria-label="Filter tasks">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              className={`todo__filter-btn${filter === f.value ? " todo__filter-btn--active" : ""}`}
              onClick={() => setFilter(f.value)}
              aria-pressed={filter === f.value}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* List */}
        {/* aria-live: screen reader announces when items change */}
        <ul className="todo__list" role="list" aria-live="polite" aria-label="Task list">
          {filtered.length === 0 ? (
            <li className="todo__empty">
              {filter === "done" ? "No completed tasks." : "No tasks yet. Add one above."}
            </li>
          ) : (
            filtered.map((item) => (
              <TodoRow
                key={item.id}
                item={item}
                onToggle={handleToggle}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </ul>

        {/* Footer */}
        <div className="todo__footer">
          <span className="todo__remaining">
            {remaining} of {items.length} remaining
          </span>
          <button
            type="button"
            className="todo__clear-btn"
            onClick={handleClearDone}
            disabled={doneCount === 0}
            aria-label={`Clear ${doneCount} completed tasks`}
          >
            Clear done ({doneCount})
          </button>
        </div>

      </div>
    </div>
  );
}

export default TodoApp;