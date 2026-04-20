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

/**
 * CME FX-futures symbol → ISO-4217 base currency code. Used to annotate
 * cryptic exchange tickers (6E, 6B, …) with a human-recognizable currency.
 */
const SYMBOL_CURRENCY: Record<string, string> = {
  "6E": "EUR",
  "6B": "GBP",
  "6J": "JPY",
  "6A": "AUD",
  "6C": "CAD",
  "6S": "CHF",
  "6N": "NZD",
};

export function currencyForSymbol(symbol: string): string | null {
  return SYMBOL_CURRENCY[symbol] ?? null;
}

/**
 * Render a symbol with its currency suffix, e.g. "6E (EUR)".
 * Falls back to the raw symbol for anything not in the map.
 */
export function formatSymbol(symbol: string): string {
  const ccy = SYMBOL_CURRENCY[symbol];
  return ccy ? `${symbol} (${ccy})` : symbol;
}
