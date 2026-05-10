import { Dialog, DialogBody, DialogFooter, DialogHeader } from "../ui/dialog.jsx";
import { Button } from "../ui/button.jsx";

export default function PaymentReceiptView({ open, onClose, receipt, onPrint, onViewSlip }) {
  const r = receipt || {};
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose?.()} size="lg">
      <DialogHeader title="Payment receipt" description="Allocation and reference details" onClose={onClose} />
      <DialogBody>
        <div className="grid gap-3 rounded-xl border border-pst-steel-200 bg-pst-steel-50/40 p-4 text-sm sm:grid-cols-2">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-pst-steel-500">Receipt No</span>
            <div className="font-mono text-pst-navy-800">{r.receiptNo || "—"}</div>
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-pst-steel-500">Receipt date</span>
            <div>{r.receiptDate ? new Date(r.receiptDate).toLocaleDateString() : "—"}</div>
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-pst-steel-500">Customer</span>
            <div>{r.customerName || "—"}</div>
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-pst-steel-500">Currency</span>
            <div>{r.currency || "—"}</div>
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-pst-steel-500">Amount received</span>
            <div className="tabular-nums font-semibold text-pst-navy-800">{Number(r.amountReceived || 0).toFixed(2)}</div>
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-pst-steel-500">Allocated</span>
            <div className="tabular-nums">{Number(r.allocatedAmount || 0).toFixed(2)}</div>
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-pst-steel-500">Unallocated</span>
            <div className="tabular-nums">{Number(r.unallocatedAmount || 0).toFixed(2)}</div>
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-pst-steel-500">Mode</span>
            <div>{String(r.paymentMode || "").replaceAll("_", " ") || "—"}</div>
          </div>
          <div className="sm:col-span-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-pst-steel-500">Bank / cash account</span>
            <div>{r.bankCashAccountName || r.accountName || "—"}</div>
          </div>
          <div className="sm:col-span-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-pst-steel-500">Payment reference</span>
            <div className="font-mono text-xs">{r.paymentReference || "—"}</div>
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-pst-steel-500">Proforma</span>
            <div className="font-mono text-xs">{r.proformaInvoiceNo || "—"}</div>
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-pst-steel-500">Sales invoice</span>
            <div className="font-mono text-xs">{r.salesInvoiceNo || "—"}</div>
          </div>
          <div className="sm:col-span-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-pst-steel-500">Remarks</span>
            <div className="whitespace-pre-wrap text-pst-steel-700">{r.remarks || "—"}</div>
          </div>
        </div>
      </DialogBody>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onPrint?.(r._id)}>
          Print
        </Button>
        <Button type="button" variant="outline" disabled={!r.attachmentKey} onClick={() => onViewSlip?.(r._id)}>
          View slip
        </Button>
        <Button type="button" variant="primary" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
