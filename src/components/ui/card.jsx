import { cn } from "../../lib/cn.js";

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-pst-steel-200 bg-white shadow-[var(--shadow-pst-card)] transition-shadow",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return (
    <div className={cn("flex flex-col gap-1 p-5 pb-3", className)} {...props} />
  );
}

export function CardTitle({ className, ...props }) {
  return (
    <h3
      className={cn("text-base font-semibold tracking-tight text-pst-navy-800", className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }) {
  return (
    <p className={cn("text-xs text-pst-steel-500", className)} {...props} />
  );
}

export function CardContent({ className, ...props }) {
  return <div className={cn("p-5 pt-0", className)} {...props} />;
}

export function CardFooter({ className, ...props }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-t border-pst-steel-200 px-5 py-3",
        className
      )}
      {...props}
    />
  );
}
