import { useMemo, useState } from "react";
import { cn } from "../../lib/cn.js";
import { Input } from "./input.jsx";
import { Select } from "./select.jsx";
import { Button } from "./button.jsx";
import { Skeleton } from "./skeleton.jsx";
import { EmptyState } from "./empty-state.jsx";

/**
 * DataTable — sortable, searchable, paginated, sticky-header table.
 *
 * Props:
 *   columns: [{ key, header, sortable?, align?, className?, render?(row, idx) }]
 *   rows:    array of objects (or array of arrays — render handles both)
 *   getRowKey?(row, idx) -> string         // default: id || _id || idx
 *   pageSize?: number                       // default 10
 *   searchableKeys?: string[]               // which fields participate in global search
 *   loading?: boolean
 *   showSearch?: boolean (default true)
 *   showExport?: boolean (default true)     // shows CSV export
 *   onRowClick?(row)
 *   emptyState?: ReactNode
 *   actions?: ReactNode                     // toolbar right-aligned actions
 *   exportFileName?: string                 // base name for CSV
 *   density?: "comfortable" | "compact"
 */
export function DataTable({
  columns = [],
  rows = [],
  getRowKey,
  pageSize: pageSizeProp = 10,
  searchableKeys,
  loading = false,
  showSearch = true,
  showExport = true,
  onRowClick,
  emptyState,
  actions,
  exportFileName = "table",
  density = "comfortable",
  className = "",
}) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeProp);

  const baseKeys = useMemo(() => {
    if (Array.isArray(searchableKeys) && searchableKeys.length) return searchableKeys;
    return columns.map((c) => c.key).filter(Boolean);
  }, [searchableKeys, columns]);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((row) =>
      baseKeys.some((k) => {
        const v = row?.[k];
        if (v === null || v === undefined) return false;
        return String(v).toLowerCase().includes(q);
      })
    );
  }, [rows, search, baseKeys]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const arr = [...filtered];
    arr.sort((a, b) => {
      const av = a?.[sortKey];
      const bv = b?.[sortKey];
      if (av === bv) return 0;
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      const an = Number(av), bn = Number(bv);
      if (!Number.isNaN(an) && !Number.isNaN(bn) && av !== "" && bv !== "") {
        return sortDir === "asc" ? an - bn : bn - an;
      }
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  // Clamp the active page during render — avoids "set state in effect" patterns
  // and keeps the table self-correcting when the data set shrinks.
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const pageRows = sorted.slice(startIdx, startIdx + pageSize);

  function toggleSort(col) {
    if (col.sortable === false) return;
    if (sortKey === col.key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(col.key);
      setSortDir("asc");
    }
  }

  function exportCsv() {
    const head = columns.map((c) => `"${String(c.header ?? c.key).replace(/"/g, '""')}"`).join(",");
    const body = sorted
      .map((row) =>
        columns
          .map((c) => {
            const raw = c.csv ? c.csv(row) : row?.[c.key];
            const v = raw === null || raw === undefined ? "" : String(raw);
            return `"${v.replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\n");
    const csv = `${head}\n${body}`;
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exportFileName}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const tdPad = density === "compact" ? "px-3 py-1.5" : "px-3.5 py-2.5";
  const thPad = density === "compact" ? "px-3 py-2" : "px-3.5 py-2.5";

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {showSearch ? (
            <div className="relative">
              <Input
                placeholder="Search…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-64 pl-8"
              />
              <span aria-hidden="true" className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-pst-steel-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                </svg>
              </span>
            </div>
          ) : null}
          <span className="text-[11px] text-pst-steel-500">
            {loading ? "Loading…" : `${total} record${total === 1 ? "" : "s"}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {actions}
          {showExport ? (
            <Button variant="outline" size="sm" onClick={exportCsv} disabled={!total}>
              Export CSV
            </Button>
          ) : null}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-pst-steel-200 bg-white shadow-[var(--shadow-pst-soft)]">
        <div className="max-h-[640px] overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                {columns.map((col) => {
                  const active = sortKey === col.key;
                  return (
                    <th
                      key={col.key || col.header}
                      onClick={() => toggleSort(col)}
                      className={cn(
                        "sticky top-0 z-[2] bg-pst-steel-100 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-pst-navy-800 border-b border-pst-steel-200",
                        thPad,
                        col.align === "right" && "text-right",
                        col.align === "center" && "text-center",
                        col.sortable === false ? "cursor-default" : "cursor-pointer select-none",
                        col.className
                      )}
                      aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.header}
                        {col.sortable !== false && (
                          <span className="text-pst-steel-400">
                            {active ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                          </span>
                        )}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`sk-${i}`}>
                      {columns.map((c, j) => (
                        <td key={j} className={cn("border-b border-pst-steel-100", tdPad)}>
                          <Skeleton className="h-4 w-24" />
                        </td>
                      ))}
                    </tr>
                  ))
                : pageRows.length === 0
                  ? (
                    <tr>
                      <td colSpan={columns.length} className="p-0">
                        {emptyState || (
                          <EmptyState
                            title="No results"
                            description={search ? "Try a different search term." : "There are no records to display yet."}
                            className="border-0"
                          />
                        )}
                      </td>
                    </tr>
                  )
                  : pageRows.map((row, i) => {
                      const key = (getRowKey && getRowKey(row, i)) ?? row?.id ?? row?._id ?? `${startIdx + i}`;
                      return (
                        <tr
                          key={key}
                          onClick={onRowClick ? () => onRowClick(row) : undefined}
                          className={cn(
                            "border-b border-pst-steel-100 transition-colors",
                            "hover:bg-pst-steel-50",
                            onRowClick ? "cursor-pointer" : ""
                          )}
                        >
                          {columns.map((col) => (
                            <td
                              key={col.key || col.header}
                              className={cn(
                                "text-pst-navy-800",
                                tdPad,
                                col.align === "right" && "text-right tabular-nums",
                                col.align === "center" && "text-center",
                                col.cellClassName
                              )}
                            >
                              {col.render ? col.render(row, startIdx + i) : (row?.[col.key] ?? "")}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
            </tbody>
          </table>
        </div>
      </div>

      {total > pageSize && !loading ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] text-pst-steel-500">
            <span>Rows per page</span>
            <Select
              className="h-7 w-20 px-2 text-[11px]"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value) || 10);
                setPage(1);
              }}
            >
              {[10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </Select>
            <span>· {startIdx + 1}–{Math.min(startIdx + pageSize, total)} of {total}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" disabled={safePage <= 1} onClick={() => setPage(1)}>«</Button>
            <Button variant="outline" size="sm" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>‹ Prev</Button>
            <span className="px-2 text-[11px] text-pst-steel-500">
              Page {safePage} of {totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next ›</Button>
            <Button variant="outline" size="sm" disabled={safePage >= totalPages} onClick={() => setPage(totalPages)}>»</Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
