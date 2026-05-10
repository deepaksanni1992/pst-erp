import { useState } from "react";
import { cn } from "../../lib/cn.js";

/** CSS-only tooltip (small dependency-free helper). */
export function Tooltip({ content, side = "top", children, className = "" }) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && content ? (
        <span
          role="tooltip"
          className={cn(
            "pointer-events-none absolute z-40 whitespace-nowrap rounded-md bg-pst-navy-900 px-2 py-1 text-[11px] font-medium text-white shadow-md",
            "pst-fade-in",
            side === "top" && "bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2",
            side === "bottom" && "top-[calc(100%+6px)] left-1/2 -translate-x-1/2",
            side === "left" && "right-[calc(100%+6px)] top-1/2 -translate-y-1/2",
            side === "right" && "left-[calc(100%+6px)] top-1/2 -translate-y-1/2"
          )}
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}
