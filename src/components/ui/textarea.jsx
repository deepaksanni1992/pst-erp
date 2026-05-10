import { cn } from "../../lib/cn.js";

export function Textarea({ className, rows = 3, ...props }) {
  return (
    <textarea
      rows={rows}
      className={cn(
        "min-h-[72px] w-full rounded-lg border border-pst-steel-200 bg-white px-3 py-2 text-sm text-pst-navy-800 placeholder:text-pst-steel-400",
        "focus:border-pst-orange focus:ring-2 focus:ring-pst-orange/30 focus:outline-none",
        "transition-colors",
        className
      )}
      {...props}
    />
  );
}
