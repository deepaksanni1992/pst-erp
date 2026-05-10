import { cn } from "../../lib/cn.js";

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "h-9 w-full rounded-lg border border-pst-steel-200 bg-white px-3 text-sm text-pst-navy-800 placeholder:text-pst-steel-400",
        "focus:border-pst-orange focus:ring-2 focus:ring-pst-orange/30 focus:outline-none",
        "disabled:bg-pst-steel-50 disabled:text-pst-steel-500 disabled:cursor-not-allowed",
        "transition-colors",
        className
      )}
      {...props}
    />
  );
}
