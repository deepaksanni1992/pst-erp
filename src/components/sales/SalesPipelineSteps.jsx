import { cn } from "../../lib/cn.js";

const STEP_KEYS = ["quotation", "oa", "pi", "allocation", "rts", "invoice"];

const LABELS = {
  quotation: "Quotation",
  oa: "OA",
  pi: "PI",
  allocation: "Allocation",
  rts: "RTS",
  invoice: "Invoice",
};

const REF_KEYS = {
  quotation: "quotationNo",
  oa: "oaNo",
  pi: "piNo",
  allocation: "allocationNo",
  rts: "rtsNo",
  invoice: "invoiceNo",
};

/**
 * Horizontal sales document pipeline — presentation only.
 *
 * @param {{ quotationNo?, oaNo?, piNo?, allocationNo?, rtsNo?, invoiceNo? }} refs
 * @param {"quotation"|"oa"|"pi"|"allocation"|"rts"|"invoice"} highlight — current context
 */
export function SalesPipelineSteps({ refs = {}, highlight = "quotation", className = "" }) {
  const hi = STEP_KEYS.includes(highlight) ? highlight : "quotation";
  const hiIdx = STEP_KEYS.indexOf(hi);

  return (
    <div
      className={cn(
        "flex flex-wrap items-stretch gap-2 rounded-xl border border-pst-steel-200 bg-pst-steel-50/80 px-3 py-2.5 text-[11px] shadow-[var(--shadow-pst-soft)]",
        className
      )}
    >
      <span className="sr-only">Sales document flow</span>
      {STEP_KEYS.map((key, i) => {
        const refKey = REF_KEYS[key];
        const refVal = refs?.[refKey];
        const hasRef = refVal != null && String(refVal).trim() !== "";
        const isCurrent = key === hi;
        const isPast = i < hiIdx && hasRef;

        return (
          <div key={key} className="flex min-w-0 flex-1 items-center gap-2 sm:flex-initial sm:min-w-[7rem]">
            <div
              className={cn(
                "min-w-0 flex-1 rounded-lg border px-2 py-1.5 text-left transition-colors",
                isCurrent
                  ? "border-pst-orange/60 bg-white ring-1 ring-pst-orange/30"
                  : isPast
                    ? "border-emerald-200/80 bg-emerald-50/60"
                    : "border-pst-steel-200/90 bg-white/70"
              )}
            >
              <div className="font-semibold uppercase tracking-wide text-pst-steel-500">{LABELS[key]}</div>
              <div
                className={cn(
                  "truncate font-mono text-[11px] text-pst-navy-800 tabular-nums",
                  !hasRef && "text-pst-steel-400"
                )}
                title={hasRef ? String(refVal) : undefined}
              >
                {hasRef ? String(refVal) : "—"}
              </div>
            </div>
            {i < STEP_KEYS.length - 1 ? (
              <span className="hidden text-pst-steel-300 sm:inline" aria-hidden="true">
                →
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
