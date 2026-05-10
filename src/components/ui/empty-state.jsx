import { cn } from "../../lib/cn.js";

export function EmptyState({
  icon = null,
  title = "Nothing to show",
  description = "",
  action = null,
  className = "",
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-pst-steel-300 bg-white py-10 px-6 text-center",
        className
      )}
    >
      {icon ? (
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-pst-steel-100 text-pst-steel-500">
          {icon}
        </div>
      ) : null}
      <div>
        <div className="text-sm font-semibold text-pst-navy-800">{title}</div>
        {description ? (
          <div className="mt-1 text-xs text-pst-steel-500">{description}</div>
        ) : null}
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
