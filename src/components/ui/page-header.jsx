import { cn } from "../../lib/cn.js";

export function PageHeader({
  eyebrow = "",
  title,
  description = "",
  breadcrumbs = [],
  actions = null,
  className = "",
}) {
  return (
    <div className={cn("mb-6", className)}>
      {breadcrumbs?.length ? (
        <nav aria-label="Breadcrumb" className="mb-2 flex flex-wrap items-center gap-1 text-[11px] text-pst-steel-500">
          {breadcrumbs.map((b, i) => (
            <span key={i} className="inline-flex items-center gap-1">
              {i > 0 ? <span aria-hidden="true">/</span> : null}
              {b.href ? (
                <a className="hover:text-pst-navy-700 hover:underline" href={b.href}>
                  {b.label}
                </a>
              ) : (
                <span>{b.label}</span>
              )}
            </span>
          ))}
        </nav>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow ? (
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pst-orange">
              {eyebrow}
            </div>
          ) : null}
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-pst-navy-800">
            {title}
          </h1>
          {description ? (
            <p className="mt-1.5 max-w-2xl text-sm text-pst-steel-500">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}
