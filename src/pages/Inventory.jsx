import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGetWithQuery, apiPost } from "../lib/api.js";
import { toast } from "../lib/toast.js";

import { PageHeader } from "../components/ui/page-header.jsx";
import { Card, CardContent } from "../components/ui/card.jsx";
import { Section } from "../components/ui/section.jsx";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs.jsx";
import { DataTable } from "../components/ui/data-table.jsx";
import { Button } from "../components/ui/button.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Input } from "../components/ui/input.jsx";
import { Label } from "../components/ui/label.jsx";
import { Select } from "../components/ui/select.jsx";
import { Textarea } from "../components/ui/textarea.jsx";
import { Dialog, DialogHeader, DialogBody, DialogFooter } from "../components/ui/dialog.jsx";
import { EmptyState } from "../components/ui/empty-state.jsx";

const TABS = [
  { id: "balances", label: "Stock balances" },
  { id: "ledger", label: "Stock ledger" },
  { id: "movements", label: "Movements" },
  { id: "negative", label: "Negative stock" },
];

const MOVEMENT_TYPES = [
  "IN_PURCHASE",
  "IN_GRN",
  "IN_OPENING",
  "IN_ADJUSTMENT",
  "OUT_SALES",
  "OUT_RTS",
  "OUT_ADJUSTMENT",
  "TRANSFER_IN",
  "TRANSFER_OUT",
];

const REFERENCE_TYPES = ["MANUAL", "PO", "GRN", "SO", "RTS", "ALLOCATION", "ADJUSTMENT", "OPENING"];

function fmtNum(v, d = 0) {
  const n = Number(v ?? 0);
  if (Number.isNaN(n)) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: d, minimumFractionDigits: d });
}

function StockTone({ value }) {
  const n = Number(value ?? 0);
  if (n < 0) return <Badge tone="danger">{fmtNum(n)}</Badge>;
  if (n === 0) return <Badge tone="warning">{fmtNum(n)}</Badge>;
  return <span className="tabular-nums">{fmtNum(n)}</span>;
}

export default function Inventory() {
  const qc = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read tab from URL (?tab=balances|ledger|movements|negative)
  const initialTab = (() => {
    const t = searchParams.get("tab");
    return TABS.some((x) => x.id === t) ? t : "balances";
  })();
  const [tab, setTab] = useState(initialTab);

  function changeTab(next) {
    setTab(next);
    setPage(1);
    setSearchParams((sp) => {
      const np = new URLSearchParams(sp);
      np.set("tab", next);
      return np;
    }, { replace: true });
  }

  const [page, setPage] = useState(1);
  const limit = 40;
  const [filterItem, setFilterItem] = useState("");
  const [filterWh, setFilterWh] = useState("");
  const [modal, setModal] = useState(null); // "in" | "out" | "adj" | "open" | null
  const [err, setErr] = useState("");

  const balQuery = useQuery({
    queryKey: ["stockBalances", page, filterItem, filterWh],
    queryFn: () =>
      apiGetWithQuery("/inventory/balances", {
        page,
        limit,
        itemCode: filterItem.trim() || undefined,
        warehouse: filterWh.trim() || undefined,
      }),
    enabled: tab === "balances" || tab === "negative",
  });

  const ledQuery = useQuery({
    queryKey: ["inventoryLedger", page, filterItem, filterWh],
    queryFn: () =>
      apiGetWithQuery("/inventory/ledger", {
        page,
        limit,
        itemCode: filterItem.trim() || undefined,
        warehouse: filterWh.trim() || undefined,
      }),
    enabled: tab === "ledger",
  });

  const movementMutation = useMutation({
    mutationFn: ({ path, body }) => apiPost(path, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stockBalances"] });
      qc.invalidateQueries({ queryKey: ["inventoryLedger"] });
      setModal(null);
      setErr("");
      toast.success("Stock movement posted");
    },
    onError: (e) => {
      setErr(e.message);
      toast.error(e.message || "Failed to post stock movement");
    },
  });

  const [mv, setMv] = useState({
    itemCode: "",
    warehouse: "MAIN",
    qty: 1,
    qtyDelta: 0,
    quantity: 0,
    unitCost: 0,
    referenceType: "MANUAL",
    referenceNumber: "",
    remarks: "",
    movementType: "IN_PURCHASE",
  });

  function resetMv(extra = {}) {
    setMv({
      itemCode: "",
      warehouse: "MAIN",
      qty: 1,
      qtyDelta: 0,
      quantity: 0,
      unitCost: 0,
      referenceType: "MANUAL",
      referenceNumber: "",
      remarks: "",
      movementType: "IN_PURCHASE",
      ...extra,
    });
  }

  function openModal(kind) {
    setErr("");
    resetMv(kind === "in"  ? { movementType: "IN_PURCHASE" }
         : kind === "out" ? { movementType: "OUT_SALES" }
         : {});
    setModal(kind);
  }

  const balRows = balQuery.data?.items ?? [];
  const balTotal = balQuery.data?.total ?? 0;
  const ledRows = ledQuery.data?.items ?? [];
  const ledTotal = ledQuery.data?.total ?? 0;
  const activeTotal = tab === "ledger" ? ledTotal : balTotal;
  const totalPages = Math.max(1, Math.ceil(activeTotal / limit));

  const negativeRows = useMemo(() => {
    return (balRows || []).filter((r) => Number(r.availableQty ?? r.quantity ?? 0) < 0);
  }, [balRows]);

  const balanceColumns = useMemo(() => [
    { key: "itemCode",     header: "Article",
      render: (r) => <span className="font-mono text-[12px]">{r.itemCode}</span> },
    { key: "warehouse",    header: "Warehouse" },
    { key: "quantity",     header: "Physical",  align: "right",
      render: (r) => fmtNum(r.quantity) },
    { key: "reservedQty",  header: "Reserved",  align: "right",
      render: (r) => fmtNum(r.reservedQty) },
    { key: "rtsQty",       header: "RTS",       align: "right",
      render: (r) => fmtNum(r.rtsQty) },
    { key: "availableQty", header: "Available", align: "right",
      render: (r) => <StockTone value={r.availableQty} />,
      sortable: true },
    { key: "unitCost",     header: "Unit cost", align: "right",
      render: (r) => fmtNum(r.unitCost, 2) },
  ], []);

  const ledgerColumns = useMemo(() => [
    { key: "createdAt",       header: "Date",
      render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleString() : "—" },
    { key: "movementType",    header: "Type",
      render: (r) => <Badge tone={String(r.movementType || "").startsWith("IN_") ? "success" : "navy"}>
        {String(r.movementType || "").replace(/_/g, " ")}
      </Badge>, sortable: false },
    { key: "itemCode",        header: "Article",
      render: (r) => <span className="font-mono text-[12px]">{r.itemCode}</span> },
    { key: "warehouse",       header: "Wh" },
    { key: "qtyDelta",        header: "Δ Qty", align: "right",
      render: (r) => {
        const n = Number(r.qtyDelta || 0);
        return <span className={n < 0 ? "text-rose-600 font-semibold tabular-nums" : "text-emerald-700 font-semibold tabular-nums"}>{n > 0 ? "+" : ""}{fmtNum(n)}</span>;
      } },
    { key: "referenceNumber", header: "Reference",
      render: (r) => r.referenceNumber || r.referenceType || "—" },
    { key: "remarks",         header: "Remarks" },
  ], []);

  const negativeColumns = useMemo(() => [
    { key: "itemCode",     header: "Article",
      render: (r) => <span className="font-mono text-[12px]">{r.itemCode}</span> },
    { key: "warehouse",    header: "Warehouse" },
    { key: "quantity",     header: "Physical", align: "right" },
    { key: "reservedQty",  header: "Reserved", align: "right" },
    { key: "availableQty", header: "Available", align: "right",
      render: (r) => <Badge tone="danger">{fmtNum(r.availableQty)}</Badge>, sortable: false },
    { key: "lastReferenceNumber", header: "Caused by",
      render: (r) => r.lastReferenceNumber || r.lastReferenceCustomer || r.lastAllocationCustomer || "—",
      sortable: false },
    { key: "unitCost",     header: "Unit cost", align: "right",
      render: (r) => fmtNum(r.unitCost, 2) },
  ], []);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => { setPage(1); }, [filterItem, filterWh, tab]);
  /* eslint-enable react-hooks/exhaustive-deps */

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Inventory"
        description="Live stock balances, movement ledger, and manual adjustments."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => openModal("in")}>+ Stock in</Button>
            <Button variant="outline" size="sm" onClick={() => openModal("out")}>− Stock out</Button>
            <Button variant="outline" size="sm" onClick={() => openModal("adj")}>± Adjustment</Button>
            <Button size="sm" onClick={() => openModal("open")}>Opening balance</Button>
          </>
        }
      />

      {err ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {err}
        </div>
      ) : null}

      <Tabs value={tab} onValueChange={changeTab}>
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.id} value={t.id}>
              {t.label}
              {t.id === "negative" && negativeRows.length > 0 ? (
                <span className="ml-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] text-white">
                  {negativeRows.length}
                </span>
              ) : null}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Filter strip — shown for tabs that benefit from it */}
        {tab !== "movements" ? (
          <Card>
            <CardContent className="p-4">
              <div className="grid gap-3 md:grid-cols-4">
                <div>
                  <Label>Article</Label>
                  <Input placeholder="Search article…" value={filterItem} onChange={(e) => setFilterItem(e.target.value)} />
                </div>
                <div>
                  <Label>Warehouse</Label>
                  <Input placeholder="MAIN, BRANCH-1…" value={filterWh} onChange={(e) => setFilterWh(e.target.value)} />
                </div>
                <div className="flex items-end gap-2 md:col-span-2">
                  <Button variant="outline" size="sm" onClick={() => { setFilterItem(""); setFilterWh(""); setPage(1); }}>Reset</Button>
                  <Button size="sm" onClick={() => setPage(1)}>Apply filters</Button>
                  <span className="ml-auto text-[11px] text-pst-steel-500">Showing page {page} of {totalPages} · {activeTotal} rows</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <TabsContent value="balances">
          <DataTable
            rows={balRows}
            columns={balanceColumns}
            loading={balQuery.isLoading}
            pageSize={limit}
            exportFileName="stock-balances"
            density="compact"
            getRowKey={(r, i) => r._id || `${r.itemCode}-${r.warehouse}-${i}`}
            emptyState={<EmptyState title="No stock balances" description="No items match these filters." className="border-0" />}
          />
          <ServerPager page={page} totalPages={totalPages} total={activeTotal} onPrev={() => setPage((p) => Math.max(1, p - 1))} onNext={() => setPage((p) => Math.min(totalPages, p + 1))} />
        </TabsContent>

        <TabsContent value="ledger">
          <DataTable
            rows={ledRows}
            columns={ledgerColumns}
            loading={ledQuery.isLoading}
            pageSize={limit}
            exportFileName="stock-ledger"
            density="compact"
            getRowKey={(r, i) => r._id || `${r.itemCode}-${r.createdAt}-${i}`}
            emptyState={<EmptyState title="Ledger is empty" description="No stock movements recorded for the current filter." className="border-0" />}
          />
          <ServerPager page={page} totalPages={totalPages} total={activeTotal} onPrev={() => setPage((p) => Math.max(1, p - 1))} onNext={() => setPage((p) => Math.min(totalPages, p + 1))} />
        </TabsContent>

        <TabsContent value="movements">
          <Section
            title="Stock movement actions"
            description="Post manual stock-in, stock-out, adjustments, or opening balances. Every movement is recorded in the ledger and audit trail."
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" onClick={() => openModal("in")}>
                <span className="text-emerald-600 font-semibold">+ Stock in</span>
              </Button>
              <Button variant="outline" onClick={() => openModal("out")}>
                <span className="text-rose-600 font-semibold">− Stock out</span>
              </Button>
              <Button variant="outline" onClick={() => openModal("adj")}>
                <span className="text-amber-600 font-semibold">± Adjustment</span>
              </Button>
              <Button onClick={() => openModal("open")}>Opening balance</Button>
            </div>
            <p className="mt-4 text-[12px] text-pst-steel-500">
              Tip: most stock movements are auto-generated by GRN, sales invoices, RTS, and allocations. Use these manual posts only for exceptions or initial loads.
            </p>
          </Section>
        </TabsContent>

        <TabsContent value="negative">
          <DataTable
            rows={negativeRows}
            columns={negativeColumns}
            loading={balQuery.isLoading}
            pageSize={limit}
            exportFileName="negative-stock"
            density="compact"
            getRowKey={(r, i) => r._id || `${r.itemCode}-${r.warehouse}-${i}`}
            emptyState={<EmptyState title="All stock levels healthy" description="No negative-stock items in the current scope." className="border-0" />}
          />
        </TabsContent>
      </Tabs>

      {/* ── Movement modals ────────────────────────────────────────────────── */}
      <MovementDialog
        open={modal === "in"}
        title="Stock in"
        description="Post a manual stock-in entry. Use this for non-PO receipts and corrections."
        submitLabel="Post stock in"
        loading={movementMutation.isPending}
        onClose={() => setModal(null)}
        onSubmit={() =>
          movementMutation.mutate({
            path: "/inventory/stock-in",
            body: {
              itemCode: mv.itemCode,
              warehouse: mv.warehouse,
              qty: mv.qty,
              unitCost: mv.unitCost,
              movementType: mv.movementType || "IN_PURCHASE",
              referenceType: mv.referenceType,
              referenceNumber: mv.referenceNumber,
              remarks: mv.remarks,
            },
          })
        }
      >
        <MovementForm mv={mv} setMv={setMv} variant="in" />
      </MovementDialog>

      <MovementDialog
        open={modal === "out"}
        title="Stock out"
        description="Post a manual stock-out entry. Use this for write-offs or corrections."
        submitLabel="Post stock out"
        loading={movementMutation.isPending}
        onClose={() => setModal(null)}
        onSubmit={() =>
          movementMutation.mutate({
            path: "/inventory/stock-out",
            body: {
              itemCode: mv.itemCode,
              warehouse: mv.warehouse,
              qty: mv.qty,
              referenceType: mv.referenceType || "MANUAL",
              referenceNumber: mv.referenceNumber,
              remarks: mv.remarks,
            },
          })
        }
      >
        <MovementForm mv={mv} setMv={setMv} variant="out" />
      </MovementDialog>

      <MovementDialog
        open={modal === "adj"}
        title="Stock adjustment"
        description="Use a positive Δ to increase, negative Δ to decrease."
        submitLabel="Post adjustment"
        loading={movementMutation.isPending}
        onClose={() => setModal(null)}
        onSubmit={() =>
          movementMutation.mutate({
            path: "/inventory/adjust",
            body: {
              itemCode: mv.itemCode,
              warehouse: mv.warehouse,
              qtyDelta: mv.qtyDelta,
              remarks: mv.remarks,
            },
          })
        }
      >
        <MovementForm mv={mv} setMv={setMv} variant="adj" />
      </MovementDialog>

      <MovementDialog
        open={modal === "open"}
        title="Opening balance"
        description="Set the initial on-hand quantity for an article and warehouse."
        submitLabel="Save opening balance"
        loading={movementMutation.isPending}
        onClose={() => setModal(null)}
        onSubmit={() =>
          movementMutation.mutate({
            path: "/inventory/opening",
            body: {
              itemCode: mv.itemCode,
              warehouse: mv.warehouse,
              quantity: mv.quantity,
              unitCost: mv.unitCost,
              remarks: mv.remarks,
            },
          })
        }
      >
        <MovementForm mv={mv} setMv={setMv} variant="open" />
      </MovementDialog>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */

function ServerPager({ page, totalPages, total, onPrev, onNext }) {
  if (total <= 0) return null;
  return (
    <div className="mt-3 flex items-center justify-between">
      <span className="text-[11px] text-pst-steel-500">
        Server page {page} of {totalPages} · {total} rows
      </span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={onPrev}>‹ Prev</Button>
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={onNext}>Next ›</Button>
      </div>
    </div>
  );
}

function MovementDialog({ open, title, description, children, submitLabel, loading, onClose, onSubmit }) {
  return (
    <Dialog open={open} onOpenChange={onClose} size="lg">
      <DialogHeader title={title} description={description} onClose={onClose} />
      <DialogBody>{children}</DialogBody>
      <DialogFooter>
        <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
        <Button size="sm" onClick={onSubmit} disabled={loading}>
          {loading ? "Posting…" : submitLabel}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

function MovementForm({ mv, setMv, variant }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <Label>Article *</Label>
        <Input placeholder="e.g. ART-1234" value={mv.itemCode} onChange={(e) => setMv((m) => ({ ...m, itemCode: e.target.value }))} />
      </div>
      <div>
        <Label>Warehouse</Label>
        <Input placeholder="MAIN" value={mv.warehouse} onChange={(e) => setMv((m) => ({ ...m, warehouse: e.target.value }))} />
      </div>

      {variant === "in" || variant === "out" ? (
        <div>
          <Label>Quantity *</Label>
          <Input type="number" value={mv.qty} onChange={(e) => setMv((m) => ({ ...m, qty: Number(e.target.value) }))} />
        </div>
      ) : null}
      {variant === "adj" ? (
        <div>
          <Label>Qty Δ * (positive or negative)</Label>
          <Input type="number" value={mv.qtyDelta} onChange={(e) => setMv((m) => ({ ...m, qtyDelta: Number(e.target.value) }))} />
        </div>
      ) : null}
      {variant === "open" ? (
        <div>
          <Label>Opening qty *</Label>
          <Input type="number" value={mv.quantity} onChange={(e) => setMv((m) => ({ ...m, quantity: Number(e.target.value) }))} />
        </div>
      ) : null}

      {variant === "in" || variant === "open" ? (
        <div>
          <Label>Unit cost</Label>
          <Input type="number" step="0.01" value={mv.unitCost} onChange={(e) => setMv((m) => ({ ...m, unitCost: Number(e.target.value) }))} />
        </div>
      ) : null}

      {variant === "in" ? (
        <div>
          <Label>Movement type</Label>
          <Select value={mv.movementType} onChange={(e) => setMv((m) => ({ ...m, movementType: e.target.value }))}>
            {MOVEMENT_TYPES.filter((t) => t.startsWith("IN_")).map((t) => (
              <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
            ))}
          </Select>
        </div>
      ) : null}

      {variant === "in" || variant === "out" ? (
        <>
          <div>
            <Label>Reference type</Label>
            <Select value={mv.referenceType} onChange={(e) => setMv((m) => ({ ...m, referenceType: e.target.value }))}>
              {REFERENCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </div>
          <div>
            <Label>Reference no.</Label>
            <Input value={mv.referenceNumber} onChange={(e) => setMv((m) => ({ ...m, referenceNumber: e.target.value }))} />
          </div>
        </>
      ) : null}

      <div className="sm:col-span-2">
        <Label>Remarks</Label>
        <Textarea rows={2} value={mv.remarks} onChange={(e) => setMv((m) => ({ ...m, remarks: e.target.value }))} />
      </div>
    </div>
  );
}
