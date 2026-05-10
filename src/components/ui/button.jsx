import { cva } from "class-variance-authority";
import { cn } from "../../lib/cn.js";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg",
    "text-sm font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pst-orange/50 focus-visible:ring-offset-1",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-pst-navy-800 text-white hover:bg-pst-navy-700 shadow-sm",
        accent:
          "bg-pst-orange text-white hover:bg-pst-orange-soft shadow-sm",
        outline:
          "border border-pst-steel-200 bg-white text-pst-navy-800 hover:bg-pst-steel-50 hover:border-pst-steel-300",
        ghost:
          "text-pst-navy-800 hover:bg-pst-steel-100",
        soft:
          "bg-pst-navy-100 text-pst-navy-800 hover:bg-pst-navy-200",
        destructive:
          "bg-rose-600 text-white hover:bg-rose-500 shadow-sm",
        link:
          "text-pst-navy-700 underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4",
        lg: "h-10 px-5 text-[15px]",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? "span" : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export { buttonVariants };
