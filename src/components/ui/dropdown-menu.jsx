import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/cn.js";

/**
 * Lightweight dropdown menu — no Radix. Click outside / ESC to close.
 * Usage:
 *   <DropdownMenu trigger={<Button variant="outline">Actions</Button>}>
 *     <DropdownMenuItem onClick={...}>Edit</DropdownMenuItem>
 *     <DropdownMenuSeparator />
 *     <DropdownMenuItem destructive onClick={...}>Delete</DropdownMenuItem>
 *   </DropdownMenu>
 */
export function DropdownMenu({ trigger, children, align = "right", className = "" }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e) {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className={cn("relative inline-block", className)}>
      <span onClick={() => setOpen((v) => !v)}>{trigger}</span>
      {open ? (
        <div
          role="menu"
          className={cn(
            "absolute z-40 mt-1 min-w-[12rem] origin-top rounded-lg border border-pst-steel-200 bg-white p-1 shadow-lg shadow-pst-navy-900/10",
            "pst-fade-in",
            align === "right" ? "right-0" : "left-0"
          )}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function DropdownMenuItem({
  onClick,
  children,
  destructive = false,
  disabled = false,
  className = "",
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        destructive
          ? "text-rose-700 hover:bg-rose-50"
          : "text-pst-navy-800 hover:bg-pst-steel-100",
        className
      )}
    >
      {children}
    </button>
  );
}

export function DropdownMenuLabel({ children, className = "" }) {
  return (
    <div
      className={cn(
        "px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-pst-steel-500",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DropdownMenuSeparator({ className = "" }) {
  return <div className={cn("my-1 h-px bg-pst-steel-200", className)} />;
}
