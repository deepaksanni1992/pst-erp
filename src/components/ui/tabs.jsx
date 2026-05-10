import { createContext, useContext, useState, useId } from "react";
import { cn } from "../../lib/cn.js";

const TabsCtx = createContext(null);

export function Tabs({ value, defaultValue, onValueChange, children, className }) {
  const [internal, setInternal] = useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;
  const setCurrent = (v) => {
    if (!isControlled) setInternal(v);
    onValueChange?.(v);
  };
  const id = useId();
  return (
    <TabsCtx.Provider value={{ value: current, setValue: setCurrent, idBase: id }}>
      <div className={cn("flex flex-col gap-3", className)}>{children}</div>
    </TabsCtx.Provider>
  );
}

export function TabsList({ className, children }) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex h-9 items-center gap-1 rounded-lg bg-pst-steel-100 p-1",
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className, disabled = false }) {
  const ctx = useContext(TabsCtx);
  if (!ctx) throw new Error("TabsTrigger must be used inside Tabs");
  const active = ctx.value === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-controls={`${ctx.idBase}-${value}-panel`}
      id={`${ctx.idBase}-${value}-tab`}
      disabled={disabled}
      onClick={() => ctx.setValue(value)}
      className={cn(
        "relative inline-flex h-7 items-center justify-center whitespace-nowrap rounded-md px-3 text-xs font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pst-orange/40",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        active
          ? "bg-white text-pst-navy-800 shadow-[var(--shadow-pst-soft)]"
          : "text-pst-steel-600 hover:text-pst-navy-800",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className }) {
  const ctx = useContext(TabsCtx);
  if (!ctx) throw new Error("TabsContent must be used inside Tabs");
  if (ctx.value !== value) return null;
  return (
    <div
      role="tabpanel"
      id={`${ctx.idBase}-${value}-panel`}
      aria-labelledby={`${ctx.idBase}-${value}-tab`}
      className={cn("pst-fade-in", className)}
    >
      {children}
    </div>
  );
}
