import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function severityClass(sev: "LOW" | "MEDIUM" | "HIGH"): string {
  if (sev === "HIGH") return "text-bad border-bad/40 bg-bad/10";
  if (sev === "MEDIUM") return "text-warn border-warn/40 bg-warn/10";
  return "text-accent border-accent/40 bg-accent/10";
}

export function categoryClass(cat: string): string {
  if (cat === "major_event") return "text-bad";
  if (cat === "probable_institutional") return "text-warn";
  if (cat === "significant") return "text-accent";
  return "text-muted";
}

export function formatPrice(n: number | null | undefined, digits = 5) {
  if (n == null) return "—";
  return n.toFixed(digits);
}
