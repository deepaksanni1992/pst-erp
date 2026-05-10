import { useMemo } from "react";
import { KpiCard } from "../ui/kpi-card.jsx";
import { Button } from "../ui/button.jsx";
import { cn } from "../../lib/cn.js";

function sumByCurrency(rows, amountGetter) {
  const m = new Map();
  for (const r of rows || []) {
    const c = String(r.currency || "USD").toUpperCase();
    const v = Number(amountGetter(r) ?? 0);
    if (!Number.isFinite(v)) continue;
    m.set(c, (m.get(c) || 0) + v);
  }
  return m;
}

function formatCurrencyMap(map) {
  if (!map.size) return "—";
  return [...map.entries()]
    .map(([c, v]) => `${c} ${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
    .join(" · ");
}

/**
 * Overview KPIs use existing API payloads only — no invented totals.
 * Receipt figures aggregate **current query page** (see hint).
 */
export function AccountsOverviewPanel({
  loadingAr = false,
  loadingAp = false,
  loadingRcpt = false,
  arItems = [],
  apItems = [],
  receiptItems = [],
  onNavigate,
  className = "",
}) {
  const arOutstandingByCc = useMemo(() => sumByCurrency(arItems, (r) => r.balance ?? r.balanceAmount), [arItems]);
  const arOverdueByCc = useMemo(() => {
    const overdueRows = (arItems || []).filter((r) => r.overdue);
    return sumByCurrency(overdueRows, (r) => r.balance ?? r.balanceAmount);
  }, [arItems]);
  const apOutstandingByCc = useMemo(() => sumByCurrency(apItems, (r) => r.balance), [apItems]);

  const receiptByCcReceived = useMemo(
    () => sumByCurrency(receiptItems, (r) => r.amountReceived),
    [receiptItems]
  );
  const receiptByCcUnalloc = useMemo(
    () => sumByCurrency(receiptItems, (r) => r.unallocatedAmount),
    [receiptItems]
  );

  const shortcuts = [
    { id: "cust", label: "Customer ledger" },
    { id: "supp", label: "Supplier ledger" },
    { id: "payrcpt", label: "Payment receipts" },
    { id: "outstanding", label: "Outstanding report" },
    { id: "aging", label: "Aging report" },
    { id: "si", label: "Sales invoices" },
    { id: "pi", label: "Purchase invoices" },
    { id: "payv", label: "Supplier payments" },
    { id: "cash", label: "Cash / bank" },
    { id: "bank", label: "Bank details" },
  ];

  return (
    <div className={cn("space-y-6 p-4 sm:p-5", className)}>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard
          label="AR outstanding"
          value={formatCurrencyMap(arOutstandingByCc)}
          hint="Sum of open balances from Outstanding report API"
          loading={loadingAr}
          tone="default"
        />
        <KpiCard
          label="AP outstanding"
          value={formatCurrencyMap(apOutstandingByCc)}
          hint="Sum of supplier invoice balances"
          loading={loadingAp}
          tone="default"
        />
        <KpiCard
          label="AR overdue balance"
          value={formatCurrencyMap(arOverdueByCc)}
          hint="Outstanding rows flagged overdue"
          loading={loadingAr}
          tone="warning"
        />
        <KpiCard
          label="Payments received (sample)"
          value={formatCurrencyMap(receiptByCcReceived)}
          hint="Latest 100 receipts — company totals may differ"
          loading={loadingRcpt}
          tone="accent"
        />
        <KpiCard
          label="Unallocated on sample"
          value={formatCurrencyMap(receiptByCcUnalloc)}
          hint="Per latest 100 receipts"
          loading={loadingRcpt}
          tone="default"
        />
      </div>

      <div className="rounded-xl border border-pst-steel-200 bg-pst-steel-50/40 px-4 py-3 text-xs text-pst-steel-600">
        Figures above use live API responses only. Receipt KPIs aggregate the latest page returned by{" "}
        <code className="rounded bg-white px-1">GET /payment-receipts</code> (limit 100); AR/AP sums use full outstanding
        lists from their endpoints.
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-pst-navy-800">Shortcuts</h3>
        <div className="flex flex-wrap gap-2">
          {shortcuts.map((s) => (
            <Button key={s.id} type="button" variant="outline" size="sm" onClick={() => onNavigate?.(s.id)}>
              {s.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-pst-steel-200 bg-white p-4 shadow-[var(--shadow-pst-soft)]">
          <h4 className="mb-2 text-sm font-semibold text-pst-navy-800">Top AR balances (sample)</h4>
          <div className="max-h-48 overflow-auto text-xs">
            <table className="min-w-full text-left">
              <thead className="sticky top-0 bg-pst-steel-50 text-pst-steel-600">
                <tr>
                  <th className="py-1 pr-2">Customer</th>
                  <th className="py-1 pr-2">Invoice</th>
                  <th className="py-1 text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {(arItems || [])
                  .filter((r) => Number(r.balance ?? r.balanceAmount ?? 0) > 0)
                  .slice(0, 8)
                  .map((r, i) => (
                    <tr key={`${r.sourceId || r.invoiceNo}-${i}`} className="border-t border-pst-steel-100">
                      <td className="py-1 pr-2">{r.customer}</td>
                      <td className="py-1 pr-2 font-mono">{r.invoiceNo}</td>
                      <td className="py-1 text-right tabular-nums">
                        {r.currency || "USD"} {Number(r.balance ?? r.balanceAmount ?? 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                {!arItems?.length && !loadingAr ? (
                  <tr>
                    <td colSpan={3} className="py-4 text-pst-steel-500">
                      No outstanding rows.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-pst-steel-200 bg-white p-4 shadow-[var(--shadow-pst-soft)]">
          <h4 className="mb-2 text-sm font-semibold text-pst-navy-800">Latest receipts (sample)</h4>
          <div className="max-h-48 overflow-auto text-xs">
            <table className="min-w-full text-left">
              <thead className="sticky top-0 bg-pst-steel-50 text-pst-steel-600">
                <tr>
                  <th className="py-1 pr-2">Receipt</th>
                  <th className="py-1 pr-2">Customer</th>
                  <th className="py-1 text-right">Received</th>
                  <th className="py-1 text-right">Unalloc.</th>
                </tr>
              </thead>
              <tbody>
                {(receiptItems || []).slice(0, 8).map((r) => (
                  <tr key={r._id} className="border-t border-pst-steel-100">
                    <td className="py-1 pr-2 font-mono">{r.receiptNo}</td>
                    <td className="py-1 pr-2">{r.customerName || "—"}</td>
                    <td className="py-1 text-right tabular-nums">
                      {r.currency || "USD"} {Number(r.amountReceived || 0).toFixed(2)}
                    </td>
                    <td className="py-1 text-right tabular-nums">{Number(r.unallocatedAmount || 0).toFixed(2)}</td>
                  </tr>
                ))}
                {!receiptItems?.length && !loadingRcpt ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-pst-steel-500">
                      No receipts in sample.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
