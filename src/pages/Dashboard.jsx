import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  Legend,
} from "recharts";

import { AUTH_KEY, apiGetWithQuery } from "../lib/api.js";
import { downloadCsv, downloadPdfTable } from "../lib/purchaseExport.js";
import { rangePreset, RANGE_PRESETS } from "../lib/dateRange.js";

import { PageHeader } from "../components/ui/page-header.jsx";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../components/ui/card.jsx";
import { KpiCard } from "../components/ui/kpi-card.jsx";
import { Skeleton } from "../components/ui/skeleton.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Button } from "../components/ui/button.jsx";
import { Select } from "../components/ui/select.jsx";
import { Input } from "../components/ui/input.jsx";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs.jsx";
import { DataTable } from "../components/ui/data-table.jsx";
import { Tooltip } from "../components/ui/tooltip.jsx";
import { EmptyState } from "../components/ui/empty-state.jsx";
import Modal from "../components/erp/Modal.jsx";

/* ────────────────────────────────────────────────────────────────
 * Inline icons used by KPI cards (consistent with Sidebar style)
 * ──────────────────────────────────────────────────────────────── */
const Icn = ({ d, size = 18 }) => (
  <svg
    aria-hidden="true"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const ICONS = {
  bag:     ["M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z", "M3 6h18", "M16 10a4 4 0 0 1-8 0"],
  inbox:   ["M22 12h-6l-2 3h-4l-2-3H2", "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6L18.55 5.11A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"],
  receipt: ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6", "M9 13h6", "M9 17h6"],
  cash:    ["M12 1v22", "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"],
  box:     ["M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"],
  alert:   ["M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z", "M12 9v4", "M12 17h.01"],
  truck:   ["M1 3h15v13H1z", "M16 8h4l3 3v5h-7z", "M5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z", "M18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"],
  trend:   ["M3 3v18h18", "M7 14l4-4 4 4 5-5"],
};

const NAVY = "#0b1e3f";
const NAVY_LITE = "#4670b8";
const ORANGE = "#f97316";
const STEEL = "#94a3b8";
const PIE_COLORS = ["#0b1e3f", "#1a3d7a", "#4670b8", "#f97316", "#fb923c", "#94a3b8"];

function getUserLabel() {
  try {
    const auth = JSON.parse(localStorage.getItem(AUTH_KEY) || "null");
    const u = auth?.user;
    if (!u) return "";
    return u.name || u.username || u.email || "";
  } catch {
    return "";
  }
}

function fmtCurrency(n, code = "USD") {
  const v = Number(n || 0);
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 0,
    }).format(v);
  } catch {
    return `${code} ${v.toFixed(0)}`;
  }
}

function compactNumber(n) {
  const v = Number(n || 0);
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return v.toFixed(0);
}

/* ────────────────────────────────────────────────────────────────
 * Chart wrappers
 * ──────────────────────────────────────────────────────────────── */
function ChartContainer({ children, height = 280 }) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

const tooltipStyle = {
  backgroundColor: "#fff",
  borderRadius: 8,
  border: "1px solid #e2e8f0",
  boxShadow: "0 1px 2px rgba(11,30,63,0.05), 0 8px 24px rgba(11,30,63,0.10)",
  fontSize: 12,
};

function MonthlyAreaChart({ data, color = NAVY, label = "Value" }) {
  if (!data?.length) {
    return <EmptyState title="No data yet" description="Run business activity to populate the trend." className="h-[260px]" />;
  }
  return (
    <ChartContainer height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.32} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
        <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={compactNumber} />
        <ReTooltip
          contentStyle={tooltipStyle}
          formatter={(v) => [Number(v || 0).toLocaleString(), label]}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#grad-${color.replace("#", "")})`}
        />
      </AreaChart>
    </ChartContainer>
  );
}

function MonthlyComboChart({ inSeries = [], outSeries = [] }) {
  const merged = (inSeries || []).map((row, i) => ({
    month: row.month,
    in: Number(row.value || 0),
    out: Number(outSeries?.[i]?.value || 0),
  }));
  if (!merged.length) {
    return <EmptyState title="No movement" description="Receive or issue stock to populate the chart." className="h-[260px]" />;
  }
  return (
    <ChartContainer height={260}>
      <BarChart data={merged} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
        <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={compactNumber} />
        <ReTooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="in" name="In" fill="#10b981" radius={[6, 6, 0, 0]} />
        <Bar dataKey="out" name="Out" fill={ORANGE} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}

function HorizontalRankChart({ rows, valueKey = "value", color = NAVY_LITE, height = 260 }) {
  const data = (rows || [])
    .map((r) => ({
      name: String(r._id ?? r.name ?? "Unknown").slice(0, 24),
      value: Number(r[valueKey] || 0),
    }))
    .filter((r) => r.value > 0)
    .slice(0, 7);
  if (!data.length) {
    return <EmptyState title="No data" description="No ranked rows for this period." className="h-[260px]" />;
  }
  return (
    <ChartContainer height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
        <XAxis type="number" stroke="#64748b" fontSize={11} tickFormatter={compactNumber} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" stroke="#334155" fontSize={11} width={110} tickLine={false} axisLine={false} />
        <ReTooltip
          contentStyle={tooltipStyle}
          formatter={(v) => Number(v).toLocaleString()}
        />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} fill={color} />
      </BarChart>
    </ChartContainer>
  );
}

function StockHealthDonut({ kpis }) {
  const onHand = Number(kpis?.onHandQty || 0);
  const negative = Number(kpis?.negativeStockCount || 0);
  const dead = Number(kpis?.deadStockCount || 0);
  const fast = Number(kpis?.fastMovingCount || 0);
  const data = [
    { name: "On hand qty",     value: Math.max(0, onHand) },
    { name: "Negative stock",  value: negative },
    { name: "Dead stock",      value: dead },
    { name: "Fast moving",     value: fast },
  ].filter((d) => d.value > 0);
  if (!data.length) {
    return <EmptyState title="No stock signal" description="Inventory snapshot will appear once data flows." className="h-[260px]" />;
  }
  return (
    <ChartContainer height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={64} outerRadius={96} paddingAngle={3}>
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <ReTooltip contentStyle={tooltipStyle} formatter={(v) => Number(v).toLocaleString()} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ChartContainer>
  );
}

/* ────────────────────────────────────────────────────────────────
 * Main page
 * ──────────────────────────────────────────────────────────────── */
export default function Dashboard() {
  const userLabel = getUserLabel();

  const [filters, setFilters] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("erp_bi_filters_v2") || "null");
      if (saved && typeof saved === "object") return saved;
    } catch { /* ignore — fall through to default */ }
    return {
      preset: "thisYear",
      dateFrom: rangePreset("thisYear").from,
      dateTo: rangePreset("thisYear").to,
      company: "",
      branch: "",
      warehouse: "",
      customer: "",
      supplier: "",
    };
  });

  useEffect(() => {
    localStorage.setItem("erp_bi_filters_v2", JSON.stringify(filters));
  }, [filters]);

  const queryFilters = useMemo(
    () => ({
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      company: filters.company,
      branch: filters.branch,
      warehouse: filters.warehouse,
      customer: filters.customer,
      supplier: filters.supplier,
    }),
    [filters]
  );

  const dashboard = useQuery({
    queryKey: ["analytics-dashboard-v2", queryFilters],
    queryFn: () => apiGetWithQuery("/analytics/dashboard", queryFilters),
  });

  const data = dashboard.data || {};
  const trend = data?.trendIndicators || {};
  const sales = data?.sales || {};
  const procurement = data?.procurement || {};
  const inventory = data?.inventory || {};
  const accounts = data?.accounts || {};
  const logistics = data?.logistics || {};
  const kitting = data?.kitting || {};

  const [drill, setDrill] = useState({ open: false, type: "", title: "", page: 1 });
  const drillQuery = useQuery({
    queryKey: ["analytics-drilldown", drill.type, drill.page, queryFilters],
    queryFn: () => apiGetWithQuery(`/analytics/drilldown/${drill.type}`, { ...queryFilters, page: drill.page, limit: 20 }),
    enabled: drill.open && Boolean(drill.type),
  });

  function applyPreset(key) {
    const r = rangePreset(key);
    setFilters((s) => ({ ...s, preset: key, dateFrom: r.from, dateTo: r.to }));
  }

  function exportRows(name, rows, columns) {
    if (!rows?.length) return;
    downloadCsv(`${name}.csv`, columns, rows);
    downloadPdfTable(name, "PST ERP — analytics export", columns, rows, name);
  }

  /* KPI definitions (Top KPIs requested in spec) */
  const isLoading = dashboard.isLoading;
  const monthlySalesValue = Number(sales?.kpis?.salesAmount || 0);
  const pendingPoValue = Number(procurement?.kpis?.pendingPoValue || 0);
  const inventoryValue = Number(inventory?.kpis?.stockValuation || 0);
  const negativeStockCount = Number(inventory?.kpis?.negativeStockCount || 0);
  const arOutstanding = Number(accounts?.kpis?.arOutstanding || 0);
  const apOutstanding = Number(accounts?.kpis?.apOutstanding || 0);
  const pendingDispatch = Number(logistics?.kpis?.delayedShipmentCount || 0);
  const completedKits = Number(kitting?.kpis?.completedKits || 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Executive Overview"
        title={`Welcome back${userLabel ? `, ${userLabel.split(" ")[0]}` : ""}.`}
        description="Live business intelligence across Sales, Inventory, Procurement, Accounts, Logistics, and Kitting."
        actions={
          <>
            <Select
              value={filters.preset}
              onChange={(e) => applyPreset(e.target.value)}
              className="w-44"
            >
              {RANGE_PRESETS.map((p) => (
                <option key={p.key} value={p.key}>{p.label}</option>
              ))}
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => dashboard.refetch()}
              disabled={dashboard.isFetching}
            >
              {dashboard.isFetching ? "Refreshing…" : "Refresh"}
            </Button>
          </>
        }
      />

      {/* Filter strip */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-7">
            {[
              ["company",  "Company"],
              ["branch",   "Branch"],
              ["warehouse","Warehouse"],
              ["customer", "Customer"],
              ["supplier", "Supplier"],
            ].map(([k, label]) => (
              <Input
                key={k}
                placeholder={label}
                value={filters[k]}
                onChange={(e) => setFilters((s) => ({ ...s, [k]: e.target.value }))}
              />
            ))}
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
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
            {[
              ["Sales", trend.monthlySales],
              ["Procurement", trend.monthlyProcurement],
              ["Stock IN", trend.inventoryMovementIn],
              ["A/R", trend.receivableTrend],
              ["A/P", trend.payableTrend],
            ].map(([label, t]) => {
              const v = Number(t?.deltaPct || 0);
              const tone = v > 0 ? "success" : v < 0 ? "danger" : "slate";
              const arrow = v > 0 ? "▲" : v < 0 ? "▼" : "•";
              return (
                <Badge key={label} tone={tone}>
                  {label} {arrow} {Math.abs(v).toFixed(1)}%
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* TOP KPI strip */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Monthly Sales" value={fmtCurrency(monthlySalesValue)} hint="Filtered period" icon={<Icn d={ICONS.bag} />} loading={isLoading} deltaPct={trend.monthlySales?.deltaPct} />
        <KpiCard label="Pending PO Value" value={fmtCurrency(pendingPoValue)} hint="Open commitments" icon={<Icn d={ICONS.inbox} />} loading={isLoading} />
        <KpiCard label="Inventory Value" value={fmtCurrency(inventoryValue)} hint="Stock valuation" icon={<Icn d={ICONS.box} />} loading={isLoading} />
        <KpiCard
          label="Negative Stock"
          value={negativeStockCount}
          hint="Replenishment risk"
          tone="accent"
          icon={<Icn d={ICONS.alert} />}
          loading={isLoading}
          onClick={() => setDrill({ open: true, type: "negative-stock", title: "Negative stock items", page: 1 })}
        />
        <KpiCard label="AR Outstanding" value={fmtCurrency(arOutstanding)} hint="Customer dues" icon={<Icn d={ICONS.cash} />} loading={isLoading} deltaPct={trend.receivableTrend?.deltaPct} />
        <KpiCard label="AP Outstanding" value={fmtCurrency(apOutstanding)} hint="Supplier dues"  icon={<Icn d={ICONS.cash} />} loading={isLoading} deltaPct={trend.payableTrend?.deltaPct} />
        <KpiCard
          label="Pending Dispatch"
          value={pendingDispatch}
          hint="Delayed shipments"
          tone={pendingDispatch > 0 ? "warning" : "default"}
          icon={<Icn d={ICONS.truck} />}
          loading={isLoading}
          onClick={() => setDrill({ open: true, type: "delayed-shipments", title: "Delayed shipments", page: 1 })}
        />
        <KpiCard label="Completed Kits" value={completedKits} hint="Production output" icon={<Icn d={ICONS.trend} />} loading={isLoading} />
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales trend</CardTitle>
            <CardDescription>12-month movement of sales amount</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading
              ? <Skeleton className="h-[260px] w-full" />
              : <MonthlyAreaChart data={sales?.trends?.monthlySales || []} color={NAVY} label="Sales" />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Stock health</CardTitle>
            <CardDescription>On-hand vs. risk segments</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading
              ? <Skeleton className="h-[260px] w-full" />
              : <StockHealthDonut kpis={inventory?.kpis} />}
          </CardContent>
        </Card>
      </div>

      {/* Tabs for deeper analysis */}
      <Tabs defaultValue="sales">
        <TabsList>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="procurement">Procurement</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="logistics">Logistics</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top customers</CardTitle>
                <CardDescription>Ranked by sales value</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading
                  ? <Skeleton className="h-[260px] w-full" />
                  : <HorizontalRankChart rows={sales?.topCustomers} valueKey="value" color={NAVY_LITE} />}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top selling articles</CardTitle>
                <CardDescription>Ranked by sales value</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading
                  ? <Skeleton className="h-[260px] w-full" />
                  : <HorizontalRankChart rows={sales?.topArticles || sales?.topItems} valueKey="value" color={ORANGE} />}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Stock movement</CardTitle>
                <CardDescription>In vs. out by month</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading
                  ? <Skeleton className="h-[260px] w-full" />
                  : <MonthlyComboChart inSeries={inventory?.trends?.inventoryMovementIn} outSeries={inventory?.trends?.inventoryMovementOut} />}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top moving articles</CardTitle>
                <CardDescription>Ranked by quantity moved</CardDescription>
                <div className="mt-1 flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isLoading || !(inventory?.topMovingArticles?.length)}
                    onClick={() => exportRows("inventory-top-moving",
                      inventory?.topMovingArticles || [],
                      [{ key: "_id", header: "Article" }, { key: "movedQty", header: "Moved Qty" }]
                    )}
                  >
                    Export CSV / PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading
                  ? <Skeleton className="h-[260px] w-full" />
                  : <HorizontalRankChart rows={inventory?.topMovingArticles} valueKey="movedQty" color={NAVY} />}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="procurement">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly procurement</CardTitle>
                <CardDescription>PO value by month</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading
                  ? <Skeleton className="h-[260px] w-full" />
                  : <MonthlyAreaChart data={procurement?.trends?.monthlyProcurement} color="#d97706" label="Procurement" />}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Supplier performance</CardTitle>
                <CardDescription>Top suppliers · delayed orders</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <DataTable
                  rows={procurement?.supplierPerformance || []}
                  loading={isLoading}
                  showSearch={false}
                  pageSize={5}
                  exportFileName="supplier-performance"
                  density="compact"
                  columns={[
                    { key: "_id",      header: "Supplier", render: (r) => r._id || "Unknown" },
                    { key: "totalPo",  header: "Total POs", align: "right" },
                    { key: "delayed",  header: "Delayed",   align: "right" },
                    { key: "value",    header: "PO Value",  align: "right",
                      render: (r) => Number(r.value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  ]}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="accounts">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>AR ageing</CardTitle>
                <CardDescription>Customer outstanding by bucket</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {Object.entries(accounts?.arAgeingSummary || {}).length === 0 ? (
                    <div className="col-span-full"><EmptyState title="No A/R data" description="Issue invoices and capture payments to populate ageing." /></div>
                  ) : (
                    Object.entries(accounts?.arAgeingSummary || {}).map(([k, v]) => (
                      <div key={k} className="rounded-lg border border-pst-steel-200 bg-pst-steel-50 px-3 py-2">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pst-steel-500">
                          {k.replace(/_/g, " ")}
                        </div>
                        <div className="mt-1 text-sm font-semibold text-pst-navy-800 tabular-nums">
                          {fmtCurrency(v)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Cash collection</CardTitle>
                <CardDescription>Inflow trend</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading
                  ? <Skeleton className="h-[260px] w-full" />
                  : <MonthlyAreaChart data={accounts?.trends?.cashCollectionTrend} color="#0284c7" label="Collected" />}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logistics">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Dispatch trend</CardTitle>
                <CardDescription>Outbound shipments by month</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading
                  ? <Skeleton className="h-[260px] w-full" />
                  : <ChartContainer height={260}>
                      <LineChart data={logistics?.trends?.dispatchTrend || []} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
                        <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={compactNumber} />
                        <ReTooltip contentStyle={tooltipStyle} />
                        <Line type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 3 }} />
                      </LineChart>
                    </ChartContainer>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Shipment status</CardTitle>
                <CardDescription>Status counts</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <DataTable
                  rows={logistics?.shipmentStatusSummary || []}
                  loading={isLoading}
                  pageSize={6}
                  showSearch={false}
                  exportFileName="shipment-status"
                  density="compact"
                  columns={[
                    { key: "_id",   header: "Status",  render: (r) => <Badge tone={(r._id || "").toLowerCase().includes("delay") ? "danger" : "navy"}>{r._id}</Badge> },
                    { key: "count", header: "Count",   align: "right" },
                  ]}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Lower row: alerts + activity */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Inventory alerts</CardTitle>
            <CardDescription>Items with negative or critically low stock</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              rows={(inventory?.lowStockItems || inventory?.negativeStockItems || []).slice(0, 50)}
              loading={isLoading}
              pageSize={6}
              exportFileName="inventory-alerts"
              density="compact"
              columns={[
                { key: "article",   header: "Article" },
                { key: "partNumber", header: "Part No" },
                { key: "warehouse", header: "Warehouse" },
                { key: "qty",       header: "On Hand", align: "right" },
                { key: "status",    header: "Status",
                  render: (r) =>
                    Number(r.qty || 0) < 0
                      ? <Badge tone="danger">Negative</Badge>
                      : <Badge tone="warning">Low</Badge>,
                },
              ]}
              emptyState={<EmptyState title="All stock levels look healthy" description="No negative or low-stock items in the current period." className="border-0" />}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending approvals</CardTitle>
            <CardDescription>Awaiting your action</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading
              ? <Skeleton className="h-32 w-full" />
              : (data?.pendingApprovals || []).length
                ? (
                  <ul className="space-y-2">
                    {(data.pendingApprovals || []).slice(0, 6).map((row, i) => (
                      <li key={i} className="flex items-start gap-3 rounded-lg border border-pst-steel-200 bg-white px-3 py-2">
                        <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-pst-orange-100 text-pst-orange-700 text-[10px] font-semibold">
                          {String(row.module || "").slice(0, 2).toUpperCase()}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[13px] font-medium text-pst-navy-800">{row.documentNo || row.module}</div>
                          <div className="text-[11px] text-pst-steel-500 truncate">{row.description || row.entityType}</div>
                        </div>
                        <Tooltip content={row.requestedAt ? new Date(row.requestedAt).toLocaleString() : ""}>
                          <Badge tone="navy">{row.status || "Pending"}</Badge>
                        </Tooltip>
                      </li>
                    ))}
                  </ul>
                )
                : <EmptyState title="Inbox empty" description="No items waiting on you right now." className="border-0" />}
          </CardContent>
        </Card>
      </div>

      {/* Drilldown modal */}
      <Modal open={drill.open} onClose={() => setDrill({ open: false, type: "", title: "", page: 1 })} title={drill.title || "Drilldown"} wide>
        {drillQuery.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
          </div>
        ) : (
          <div className="space-y-3">
            <DataTable
              rows={(drillQuery.data?.items || []).map((row, idx) => ({ __idx: idx, ...row }))}
              showSearch
              showExport
              pageSize={20}
              exportFileName={drill.type || "drilldown"}
              density="compact"
              getRowKey={(_, i) => i}
              columns={
                Object.keys((drillQuery.data?.items || [])[0] || { value: "" })
                  .filter((k) => k !== "__idx")
                  .map((k) => ({ key: k, header: k }))
              }
            />
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" disabled={drill.page <= 1} onClick={() => setDrill((s) => ({ ...s, page: s.page - 1 }))}>
                ‹ Prev page
              </Button>
              <div className="text-[11px] text-pst-steel-500">Server page {drill.page}</div>
              <Button variant="outline" size="sm" disabled={(drillQuery.data?.items || []).length < 20} onClick={() => setDrill((s) => ({ ...s, page: s.page + 1 }))}>
                Next page ›
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
