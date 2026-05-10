import { cn } from "../../lib/cn.js";
import { Skeleton } from "./skeleton.jsx";

const TONE_BAR = {
  default: "from-pst-navy-700 to-pst-navy-500",
  accent:  "from-pst-orange to-pst-orange-soft",
  success: "from-emerald-600 to-emerald-400",
  warning: "from-amber-500 to-amber-300",
  danger:  "from-rose-600 to-rose-400",
};

const TREND_TONE = {
  up:   "text-emerald-600 bg-emerald-50 ring-emerald-200",
  down: "text-rose-600 bg-rose-50 ring-rose-200",
  flat: "text-pst-steel-600 bg-pst-steel-100 ring-pst-steel-200",
};

function TrendBadge({ deltaPct }) {
  if (deltaPct === undefined || deltaPct === null || Number.isNaN(Number(deltaPct))) {
    return null;
  }
  const v = Number(deltaPct);
  const tone = v > 0 ? "up" : v < 0 ? "down" : "flat";
  const arrow = v > 0 ? "▲" : v < 0 ? "▼" : "•";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset",
        TREND_TONE[tone]
      )}
    >
      {arrow} {Math.abs(v).toFixed(1)}%
    </span>
  );
}

export function KpiCard({
  label,
  value,
  hint = "",
  tone = "default",
  icon = null,
  deltaPct,
  loading = false,
  onClick,
  className = "",
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "group relative w-full overflow-hidden rounded-xl border border-pst-steel-200 bg-white px-5 py-4 text-left",
        "shadow-[var(--shadow-pst-card)] transition-all",
        onClick ? "cursor-pointer hover:shadow-[var(--shadow-pst-card-hover)] hover:-translate-y-0.5" : "",
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute left-0 top-0 h-full w-1 bg-gradient-to-b",
          TONE_BAR[tone] || TONE_BAR.default
        )}
      />
      <div className="flex items-start justify-between gap-3 pl-1">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-pst-steel-500">
            {label}
          </div>
          <div className="mt-1.5 truncate text-2xl font-semibold tabular-nums text-pst-navy-800">
            {loading ? <Skeleton className="h-7 w-24" /> : value}
          </div>
          {(hint || deltaPct !== undefined) && (
            <div className="mt-1 flex items-center gap-2">
              {deltaPct !== undefined ? <TrendBadge deltaPct={deltaPct} /> : null}
              {hint ? <span className="text-[11px] text-pst-steel-500">{hint}</span> : null}
            </div>
          )}
        </div>
        {icon ? (
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
              tone === "accent"
                ? "bg-pst-orange-100 text-pst-orange-700"
                : "bg-pst-navy-100 text-pst-navy-700"
            )}
          >
            {icon}
          </div>
        ) : null}
      </div>
    </Tag>
  );
}
