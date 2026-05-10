import { cn } from "../../lib/cn.js";

/** Form-grouping section with optional title/description and an action slot. */
export function Section({
  title,
  description = "",
  actions = null,
  className = "",
  bodyClassName = "",
  children,
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-pst-steel-200 bg-white shadow-[var(--shadow-pst-soft)]",
        className
      )}
    >
      {(title || description || actions) && (
        <div className="flex flex-col gap-2 border-b border-pst-steel-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            {title ? (
              <h3 className="text-sm font-semibold tracking-tight text-pst-navy-800">
                {title}
              </h3>
            ) : null}
            {description ? (
              <p className="mt-0.5 text-xs text-pst-steel-500">{description}</p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          ) : null}
        </div>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}
