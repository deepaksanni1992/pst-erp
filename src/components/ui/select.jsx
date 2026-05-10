import { cn } from "../../lib/cn.js";

export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        "h-9 w-full rounded-lg border border-pst-steel-200 bg-white px-3 text-sm text-pst-navy-800",
        "focus:border-pst-orange focus:ring-2 focus:ring-pst-orange/30 focus:outline-none",
        "transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
