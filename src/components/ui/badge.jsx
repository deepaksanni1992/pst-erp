import { cva } from "class-variance-authority";
import { cn } from "../../lib/cn.js";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
  {
    variants: {
      tone: {
        slate:   "bg-pst-steel-100 text-pst-steel-700 ring-pst-steel-200",
        navy:    "bg-pst-navy-100 text-pst-navy-700 ring-pst-navy-200",
        success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
        warning: "bg-amber-50 text-amber-700 ring-amber-200",
        danger:  "bg-rose-50 text-rose-700 ring-rose-200",
        info:    "bg-sky-50 text-sky-700 ring-sky-200",
        accent:  "bg-pst-orange-100 text-pst-orange-700 ring-pst-orange/30",
      },
    },
    defaultVariants: { tone: "slate" },
  }
);

export function Badge({ className, tone, ...props }) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

// eslint-disable-next-line react-refresh/only-export-components
export { badgeVariants };
