import { useEffect, useRef } from "react";
import { cn } from "../../lib/cn.js";

const SIZE = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
  full: "max-w-[min(98vw,1920px)]",
};

/** Lightweight dialog (no Radix) with backdrop, focus trap-lite, ESC + outside-click close. */
export function Dialog({
  open,
  onOpenChange,
  size = "md",
  children,
  className = "",
  initialFocusRef,
}) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onOpenChange?.(false);
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setTimeout(() => {
      const target = initialFocusRef?.current || ref.current?.querySelector("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
      target?.focus?.();
    }, 30);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onOpenChange, initialFocusRef]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-pst-navy-900/50 backdrop-blur-[2px]"
        onClick={() => onOpenChange?.(false)}
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative max-h-[92vh] w-full overflow-hidden rounded-xl border border-pst-steel-200 bg-white shadow-2xl shadow-pst-navy-900/20",
          SIZE[size] || SIZE.md,
          "flex flex-col",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ title, description = "", onClose, className = "" }) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 border-b border-pst-steel-200 px-5 py-4",
        className
      )}
    >
      <div className="min-w-0">
        {title ? (
          <h2 className="text-base font-semibold tracking-tight text-pst-navy-800">
            {title}
          </h2>
        ) : null}
        {description ? (
          <p className="mt-1 text-xs text-pst-steel-500">{description}</p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-pst-steel-500 hover:bg-pst-steel-100 hover:text-pst-navy-700"
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
}

export function DialogBody({ className = "", children }) {
  return (
    <div className={cn("flex-1 overflow-y-auto px-5 py-4", className)}>
      {children}
    </div>
  );
}

export function DialogFooter({ className = "", children }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-end gap-2 border-t border-pst-steel-200 px-5 py-3",
        className
      )}
    >
      {children}
    </div>
  );
}
