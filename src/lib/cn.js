import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Compose tailwind class names safely (clsx + tailwind-merge). */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
