import { cn } from "../../lib/cn.js";

export function Label({ className, ...props }) {
  return (
    <label
      className={cn(
        "text-[11px] font-semibold uppercase tracking-[0.12em] text-pst-steel-500",
        className
      )}
      {...props}
    />
  );
}
