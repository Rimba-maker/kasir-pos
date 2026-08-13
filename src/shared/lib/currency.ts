import { CURRENCY_SYMBOL } from "@/shared/config";

/**
 * Format an integer Rupiah amount as "Rp10.000".
 * Money is always integer Rupiah — never floats — to avoid rounding bugs.
 */
export function formatRupiah(amount: number): string {
  const rounded = Math.round(amount);
  const grouped = Math.abs(rounded).toLocaleString("id-ID");
  return `${rounded < 0 ? "-" : ""}${CURRENCY_SYMBOL}${grouped}`;
}

/** Compact label for tight chips: 100000 → "100rb", 1000 → "1rb", 500 → "500". */
export function formatRupiahShort(amount: number): string {
  if (amount >= 1_000 && amount % 1_000 === 0) return `${amount / 1_000}rb`;
  return String(amount);
}
