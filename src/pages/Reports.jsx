import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet, apiGetWithQuery } from "../lib/api.js";
import { downloadCsv, downloadPdfTable } from "../lib/purchaseExport.js";
import { rangePreset, RANGE_PRESETS } from "../lib/dateRange.js";
import { toast } from "../lib/toast.js";

import { PageHeader } from "../components/ui/page-header.jsx";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../components/ui/card.jsx";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs.jsx";
import { DataTable } from "../components/ui/data-table.jsx";
import { Input } from "../components/ui/input.jsx";
import { Select } from "../components/ui/select.jsx";
import { Button } from "../components/ui/button.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { EmptyState } from "../components/ui/empty-state.jsx";
import { Skeleton } from "../components/ui/skeleton.jsx";

/* ────────────────────────────────────────────────────────────────
 * Catalog of available reports (kept here for easy extension).
 * ──────────────────────────────────────────────────────────────── */
const CATALOG = {
  sales: [
    { id: "monthly-sales",   label: "Monthly sales",     description: "Sales amount by month, last 12 months." },
    { id: "top-customers",   label: "Customer-wise sales", description: "Customers ranked by revenue." },
    { id: "top-articles",    label: "Article-wise sales", description: "Articles ranked by revenue." },
    { id: "pending-quotations", label: "Pending quotations", description: "Quotations awaiting conversion to OA." },
    { id: "pending-oa",      label: "Pending OA",        description: "Order acknowledgements not yet invoiced." },
  ],
  inventory: [
    { id: "stock-summary",   label: "Stock summary",     description: "On-hand quantity & valuation per article." },
    { id: "negative-stock",  label: "Negative stock",    description: "Items currently below zero." },
    { id: "movement",        label: "Stock movement",    description: "Receipts and issues by month." },
    { id: "allocation",      label: "Allocation report", description: "Open allocations with reservation status." },
    { id: "slow-moving",     label: "Slow-moving stock", description: "Articles with no movement in current period." },
  ],
  accounts: [
    { id: "outstanding",     label: "Outstanding report", description: "Invoices with balances still due." },
    { id: "aging",           label: "Aging analysis",     description: "AR / AP buckets by age." },
    { id: "customer-ledger", label: "Customer ledger",    description: "All entries posted against a customer." },
    { id: "supplier-ledger", label: "Supplier ledger",    description: "All entries posted against a supplier." },
  ],
  purchase: [
    { id: "po-summary",      label: "Purchase order summary", description: "POs grouped by status." },
    { id: "supplier-purchase", label: "Supplier purchase analysis", description: "Procurement spend by supplier." },
  ],
};

/* Map each report to a backend data source. We reuse the analytics dashboard payload
 * for most reports and only fall back to dedicated endpoints when needed. */
function buildRowsForReport(reportId, dashboard) {
  const sales = dashboard?.sales || {};
  const inv   = dashboard?.inventory || {};
  const proc  = dashboard?.procurement || {};
  const acct  = dashboard?.accounts || {};

  switch (reportId) {
    case "monthly-sales": {
      const rows = (sales?.trends?.monthlySales || []).map((r) => ({
        month: r.month,
        amount: Number(r.value || 0),
      }));
      return {
        rows,
        columns: [
          { key: "month",  header: "Month" },
          { key: "amount", header: "Sales amount", align: "right",
            render: (r) => Number(r.amount).toLocaleString(undefined, { maximumFractionDigits: 2 }) },
        ],
      };
    }
    case "top-customers": {
      const rows = (sales?.topCustomers || []).map((r) => ({
        customer: r._id || "Unknown",
        value:    Number(r.value || 0),
      }));
      return {
        rows,
        columns: [
          { key: "customer", header: "Customer" },
          { key: "value",    header: "Sales value", align: "right",
            render: (r) => Number(r.value).toLocaleString(undefined, { maximumFractionDigits: 2 }) },
        ],
      };
    }
    case "top-articles": {
      const list = sales?.topArticles || sales?.topItems || [];
      const rows = list.map((r) => ({
        article: r._id || "Unknown",
        value:   Number(r.value || 0),
      }));
      return {
        rows,
        columns: [
          { key: "article", header: "Article" },
          { key: "value",   header: "Sales value", align: "right",
            render: (r) => Number(r.value).toLocaleString(undefined, { maximumFractionDigits: 2 }) },
        ],
      };
    }
    case "pending-quotations": {
      const rows = sales?.pendingQuotations || [];
      return {
        rows,
        columns: [
          { key: "quotationNo", header: "Quotation #" },
          { key: "customerName", header: "Customer" },
          { key: "quotationDate", header: "Date",
            render: (r) => r.quotationDate ? new Date(r.quotationDate).toLocaleDateString() : "-" },
          { key: "currency", header: "Currency", align: "center" },
          { key: "grandTotal", header: "Amount", align: "right",
            render: (r) => Number(r.grandTotal || 0).toLocaleString(undefined, { maximumFractionDigits: 2 }) },
          { key: "status", header: "Status",
            render: (r) => <Badge tone={r.status === "Approved" ? "success" : "warning"}>{r.status || "Pending"}</Badge>,
            sortable: false },
        ],
      };
    }
    case "pending-oa": {
      const rows = sales?.pendingOA || [];
      return {
        rows,
        columns: [
          { key: "oaNo",          header: "OA #" },
          { key: "customerName",  header: "Customer" },
          { key: "oaDate",        header: "Date",
            render: (r) => r.oaDate ? new Date(r.oaDate).toLocaleDateString() : "-" },
          { key: "grandTotal",    header: "Amount", align: "right",
            render: (r) => Number(r.grandTotal || 0).toLocaleString(undefined, { maximumFractionDigits: 2 }) },
        ],
      };
    }
    case "stock-summary": {
      const rows = inv?.stockSummary || inv?.topMovingArticles || [];
      return {
        rows: rows.map((r) => ({
          article: r._id || r.article || "-",
          onHand:  Number(r.onHand || r.movedQty || 0),
          value:   Number(r.value || 0),
        })),
        columns: [
          { key: "article", header: "Article" },
          { key: "onHand",  header: "On hand", align: "right" },
          { key: "value",   header: "Value", align: "right",
            render: (r) => Number(r.value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 }) },
        ],
      };
    }
    case "negative-stock": {
      const rows = inv?.negativeStockItems || [];
      return {
        rows,
        columns: [
          { key: "article",   header: "Article" },
          { key: "partNumber", header: "Part No" },
          { key: "warehouse", header: "Warehouse" },
          { key: "qty",       header: "Qty", align: "right",
            render: (r) => <span className="text-rose-600 font-semibold">{Number(r.qty || 0).toLocaleString()}</span> },
        ],
      };
    }
    case "movement": {
      const inS  = inv?.trends?.inventoryMovementIn || [];
      const outS = inv?.trends?.inventoryMovementOut || [];
      const rows = inS.map((r, i) => ({
        month: r.month,
        in:  Number(r.value || 0),
        out: Number(outS?.[i]?.value || 0),
      }));
      return {
        rows,
        columns: [
          { key: "month", header: "Month" },
          { key: "in",    header: "In",  align: "right" },
          { key: "out",   header: "Out", align: "right" },
        ],
      };
    }
    case "allocation": {
      const rows = inv?.openAllocations || [];
      return {
        rows,
        columns: [
          { key: "allocationNo", header: "Allocation #" },
          { key: "customerName", header: "Customer" },
          { key: "article",      header: "Article" },
          { key: "qty",          header: "Qty",      align: "right" },
          { key: "shippedQty",   header: "Shipped",  align: "right" },
          { key: "pendingQty",   header: "Pending",  align: "right" },
        ],
      };
    }
    case "slow-moving": {
      const rows = inv?.slowMovingArticles || [];
      return {
        rows,
        columns: [
          { key: "article", header: "Article" },
          { key: "lastMovement", header: "Last movement",
            render: (r) => r.lastMovement ? new Date(r.lastMovement).toLocaleDateString() : "-" },
          { key: "onHand", header: "On hand", align: "right" },
        ],
      };
    }
    case "outstanding": {
      const rows = acct?.overdueCustomers || [];
      return {
        rows,
        columns: [
          { key: "customerName",  header: "Customer" },
          { key: "balanceAmount", header: "Balance", align: "right",
            render: (r) => Number(r.balanceAmount || 0).toLocaleString(undefined, { maximumFractionDigits: 2 }) },
          { key: "daysOverdue",   header: "Days overdue", align: "right",
            render: (r) => <Badge tone={Number(r.daysOverdue) > 60 ? "danger" : Number(r.daysOverdue) > 30 ? "warning" : "slate"}>{r.daysOverdue} d</Badge>,
            sortable: false },
        ],
      };
    }
    case "aging": {
      const ar = acct?.arAgeingSummary || {};
      const ap = acct?.apAgeingSummary || {};
      const rows = ["current", "0-30", "31-60", "61-90", "90+"].map((bucket) => ({
        bucket,
        ar: Number(ar?.[bucket] || 0),
        ap: Number(ap?.[bucket] || 0),
      }));
      return {
        rows,
        columns: [
          { key: "bucket", header: "Bucket" },
          { key: "ar",     header: "Receivable", align: "right",
            render: (r) => Number(r.ar).toLocaleString(undefined, { maximumFractionDigits: 2 }) },
          { key: "ap",     header: "Payable",    align: "right",
            render: (r) => Number(r.ap).toLocaleString(undefined, { maximumFractionDigits: 2 }) },
        ],
      };
    }
    case "customer-ledger": {
      const rows = acct?.customerLedgerSummary || [];
      return {
        rows,
        columns: [
          { key: "customerName", header: "Customer" },
          { key: "openingBalance", header: "Opening", align: "right" },
          { key: "debit",  header: "Debit",  align: "right" },
          { key: "credit", header: "Credit", align: "right" },
          { key: "closingBalance", header: "Closing", align: "right" },
        ],
      };
    }
    case "supplier-ledger": {
      const rows = acct?.supplierLedgerSummary || [];
      return {
        rows,
        columns: [
          { key: "supplierName", header: "Supplier" },
          { key: "openingBalance", header: "Opening", align: "right" },
          { key: "debit",  header: "Debit",  align: "right" },
          { key: "credit", header: "Credit", align: "right" },
          { key: "closingBalance", header: "Closing", align: "right" },
        ],
      };
    }
    case "po-summary": {
      const rows = (proc?.statusSummary || []).map((r) => ({
        status: r._id || "Unknown",
        count:  Number(r.count || 0),
        value:  Number(r.value || 0),
      }));
      return {
        rows,
        columns: [
          { key: "status", header: "Status" },
          { key: "count",  header: "Count", align: "right" },
          { key: "value",  header: "Value", align: "right",
            render: (r) => Number(r.value).toLocaleString(undefined, { maximumFractionDigits: 2 }) },
        ],
      };
    }
    case "supplier-purchase": {
      const rows = (proc?.supplierPerformance || []).map((r) => ({
        supplier: r._id || "Unknown",
        totalPo:  Number(r.totalPo || 0),
        delayed:  Number(r.delayed || 0),
        value:    Number(r.value || 0),
      }));
      return {
        rows,
        columns: [
          { key: "supplier", header: "Supplier" },
          { key: "totalPo",  header: "Total POs", align: "right" },
          { key: "delayed",  header: "Delayed",   align: "right" },
          { key: "value",    header: "Spend",     align: "right",
            render: (r) => Number(r.value).toLocaleString(undefined, { maximumFractionDigits: 2 }) },
        ],
      };
    }
    default:
      return { rows: [], columns: [] };
  }
}

const DEFAULT_REPORT = "monthly-sales";

export default function Reports() {
  const [section, setSection] = useState("sales");
  const [reportId, setReportId] = useState(DEFAULT_REPORT);
  const [filters, setFilters] = useState(() => {
    const r = rangePreset("thisYear");
    return {
      preset: "thisYear",
      dateFrom: r.from,
      dateTo: r.to,
      customer: "",
      supplier: "",
      warehouse: "",
    };
  });

  // Derive the effective report id. If the user picked a section that doesn't
  // contain the current `reportId`, fall back to the section's first report.
  const effectiveReportId = useMemo(() => {
    if (CATALOG[section]?.some((r) => r.id === reportId)) return reportId;
    return CATALOG[section]?.[0]?.id || reportId;
  }, [section, reportId]);

  const queryFilters = useMemo(
    () => ({
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      customer: filters.customer,
      supplier: filters.supplier,
      warehouse: filters.warehouse,
    }),
    [filters]
  );

  const dashboard = useQuery({
    queryKey: ["analytics-dashboard-reports", queryFilters],
    queryFn: () => apiGetWithQuery("/analytics/dashboard", queryFilters),
  });
  const company = useQuery({
    queryKey: ["company-active"],
    queryFn: () => apiGet("/admin/companies"),
    staleTime: 5 * 60_000,
  });

  const { rows, columns } = useMemo(
    () => buildRowsForReport(effectiveReportId, dashboard.data || {}),
    [effectiveReportId, dashboard.data]
  );

  function applyPreset(key) {
    const r = rangePreset(key);
    setFilters((s) => ({ ...s, preset: key, dateFrom: r.from, dateTo: r.to }));
  }

  function exportCsv() {
    if (!rows?.length) {
      toast.info("Nothing to export — the report is empty for this period.");
      return;
    }
    downloadCsv(`${effectiveReportId}.csv`, columns, rows);
    toast.success("CSV downloaded");
  }
  function exportPdf() {
    if (!rows?.length) {
      toast.info("Nothing to export — the report is empty for this period.");
      return;
    }
    const co = (company.data?.items || company.data || [])?.[0] || null;
    const subtitle = `${filters.dateFrom || "—"} → ${filters.dateTo || "—"}`;
    downloadPdfTable("PST ERP Report", subtitle, columns, rows, effectiveReportId, co);
    toast.success("PDF generated");
  }

  const sectionLabel = {
    sales: "Sales",
    inventory: "Inventory",
    accounts: "Accounts",
    purchase: "Purchase",
  }[section];

  const activeMeta = CATALOG[section]?.find((r) => r.id === effectiveReportId);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Insights"
        title="Reports center"
        description="Export operational and financial reports for any date range — CSV, PDF, or print."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={exportCsv}>Export CSV</Button>
            <Button size="sm" onClick={exportPdf}>Export PDF</Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>Print</Button>
          </>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-6">
            <Select value={filters.preset} onChange={(e) => applyPreset(e.target.value)}>
              {RANGE_PRESETS.map((p) => (
                <option key={p.key} value={p.key}>{p.label}</option>
              ))}
            </Select>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters((s) => ({ ...s, dateFrom: e.target.value, preset: "" }))}
            />
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters((s) => ({ ...s, dateTo: e.target.value, preset: "" }))}
            />
            <Input
              placeholder="Customer"
              value={filters.customer}
              onChange={(e) => setFilters((s) => ({ ...s, customer: e.target.value }))}
            />
            <Input
              placeholder="Supplier"
              value={filters.supplier}
              onChange={(e) => setFilters((s) => ({ ...s, supplier: e.target.value }))}
            />
            <Input
              placeholder="Warehouse"
              value={filters.warehouse}
              onChange={(e) => setFilters((s) => ({ ...s, warehouse: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section tabs */}
      <Tabs value={section} onValueChange={setSection}>
        <TabsList>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="purchase">Purchase</TabsTrigger>
        </TabsList>

        {Object.keys(CATALOG).map((sec) => (
          <TabsContent key={sec} value={sec}>
            <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
              <div className="space-y-2">
                {CATALOG[sec].map((r) => {
                  const active = sec === section && r.id === effectiveReportId;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => { setSection(sec); setReportId(r.id); }}
                      className={[
                        "group w-full rounded-lg border px-3 py-3 text-left transition-colors",
                        active
                          ? "border-pst-orange/60 bg-pst-orange-100/40 ring-1 ring-pst-orange/30"
                          : "border-pst-steel-200 bg-white hover:border-pst-steel-300 hover:bg-pst-steel-50",
                      ].join(" ")}
                    >
                      <div className={["text-sm font-semibold", active ? "text-pst-orange-700" : "text-pst-navy-800"].join(" ")}>
                        {r.label}
                      </div>
                      <div className="mt-0.5 text-[11px] text-pst-steel-500">{r.description}</div>
                    </button>
                  );
                })}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>{activeMeta?.label || sectionLabel}</CardTitle>
                  <CardDescription>
                    {activeMeta?.description || "Select a report from the list."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {dashboard.isLoading ? (
                    <div className="space-y-2 p-4">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="h-6 w-full" />
                      ))}
                    </div>
                  ) : columns.length === 0 ? (
                    <EmptyState
                      title="Pick a report"
                      description="Choose any report from the list to load data."
                      className="m-4"
                    />
                  ) : (
                    <div className="p-4">
                      <DataTable
                        rows={rows}
                        columns={columns}
                        pageSize={15}
                        exportFileName={effectiveReportId}
                        density="compact"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
