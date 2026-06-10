import { useState, useContext, createContext, useCallback } from "react";
import type { ReactNode } from "react";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  MoreHoriz as EllipsisIcon,
} from "@mui/icons-material";
import "./Pagination.css";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaginationContextValue {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  total: number;
  goTo: (page: number) => void;
  goNext: () => void;
  goPrev: () => void;
  setPageSize: (size: number) => void;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PageRenderProps {
  page: number;
  isActive: boolean;
  onClick: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const PaginationContext = createContext<PaginationContextValue | null>(null);

function usePagination(componentName: string): PaginationContextValue {
  const ctx = useContext(PaginationContext);
  if (!ctx) throw new Error(`<${componentName}> must be used inside <Pagination>`);
  return ctx;
}

// ─── Page window logic ────────────────────────────────────────────────────────

function buildPageWindow(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Prev({ label }: { label?: ReactNode }) {
  const { goPrev, hasPrev } = usePagination("Pagination.Prev");
  return (
    <button className="pagination__nav-btn" onClick={goPrev} disabled={!hasPrev} aria-label="Previous page">
      {label ?? <ChevronLeftIcon />}
    </button>
  );
}

function Next({ label }: { label?: ReactNode }) {
  const { goNext, hasNext } = usePagination("Pagination.Next");
  return (
    <button className="pagination__nav-btn" onClick={goNext} disabled={!hasNext} aria-label="Next page">
      {label ?? <ChevronRightIcon />}
    </button>
  );
}

function Pages({
  renderPage,
  renderEllipsis,
}: {
  renderPage: (props: PageRenderProps) => ReactNode;
  renderEllipsis?: (key: string) => ReactNode;
}) {
  const { currentPage, totalPages, goTo } = usePagination("Pagination.Pages");
  const pageWindow = buildPageWindow(currentPage, totalPages);

  return (
    <>
      {pageWindow.map((item, idx) => {
        if (item === "...") {
          const key = `ellipsis-${idx}`;
          return renderEllipsis ? (
            renderEllipsis(key)
          ) : (
            <span key={key} className="pagination__ellipsis" aria-hidden>
              <EllipsisIcon fontSize="small" />
            </span>
          );
        }

        return renderPage({
          page: item,
          isActive: item === currentPage,
          onClick: () => goTo(item),
        });
      })}
    </>
  );
}

function PageSize({
  options,
  label = "Rows per page:",
}: {
  options: number[];
  label?: string;
}) {
  const { pageSize, setPageSize } = usePagination("Pagination.PageSize");

  return (
    <div className="pagination__pagesize-wrapper">
      <span className="pagination__pagesize-label">{label}</span>
      <select
        className="pagination__pagesize-select"
        value={pageSize}
        onChange={(e) => setPageSize(Number(e.target.value))}
        aria-label="Rows per page"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

interface PaginationProps {
  total: number;
  defaultPageSize?: number;
  defaultPage?: number;
  onChange?: (page: number, pageSize: number) => void;
  children: ReactNode;
}

export default function Pagination({
  total,
  defaultPageSize = 10,
  defaultPage = 1,
  onChange,
  children,
}: PaginationProps) {
  const [pageSize, setPageSizeState] = useState(defaultPageSize);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const [currentPage, setCurrentPage] = useState(() =>
    Math.min(Math.max(1, defaultPage), totalPages)
  );

  const goTo = useCallback(
    (page: number) => {
      const clamped = Math.min(Math.max(1, page), totalPages);
      setCurrentPage(clamped);
      onChange?.(clamped, pageSize);
    },
    [totalPages, pageSize, onChange]
  );

  const setPageSize = useCallback(
    (size: number) => {
      setPageSizeState(size);
      const newTotalPages = Math.max(1, Math.ceil(total / size));
      const clamped = Math.min(currentPage, newTotalPages);
      setCurrentPage(clamped);
      onChange?.(clamped, size);
    },
    [total, currentPage, onChange]
  );

  const goNext = useCallback(() => goTo(currentPage + 1), [currentPage, goTo]);
  const goPrev = useCallback(() => goTo(currentPage - 1), [currentPage, goTo]);

  return (
    <PaginationContext.Provider
      value={{
        currentPage,
        totalPages,
        pageSize,
        total,
        goTo,
        goNext,
        goPrev,
        setPageSize,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1,
      }}
    >
      <nav className="pagination" aria-label="Pagination">{children}</nav>
    </PaginationContext.Provider>
  );
}

Pagination.Prev = Prev;
Pagination.Next = Next;
Pagination.Pages = Pages;
Pagination.PageSize = PageSize;