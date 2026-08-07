import type { TransactionItem } from "./types";

/** Line total after its per-line discount, never negative. */
export function lineTotal(item: Pick<TransactionItem, "unitPrice" | "qty" | "discount">): number {
  return Math.max(0, item.unitPrice * item.qty - item.discount);
}

export interface TotalsInput {
  items: Pick<TransactionItem, "unitPrice" | "qty" | "discount">[];
  /** Transaction-level discount in Rupiah. */
  discountTotal: number;
  /** Tax rate 0..1. */
  taxRate: number;
}

export interface Totals {
  subtotal: number;
  taxTotal: number;
  total: number;
}

/**
 * Order of operations (money = integer Rupiah, rounded at the tax step):
 *   subtotal  = Σ line totals
 *   taxable   = max(0, subtotal - transaction discount)
 *   taxTotal  = round(taxable * taxRate)
 *   total     = taxable + taxTotal
 */
export function calcTotals({ items, discountTotal, taxRate }: TotalsInput): Totals {
  const subtotal = items.reduce((sum, item) => sum + lineTotal(item), 0);
  const taxable = Math.max(0, subtotal - discountTotal);
  const taxTotal = Math.round(taxable * taxRate);
  return { subtotal, taxTotal, total: taxable + taxTotal };
}

/** Cash change; never negative (caller must ensure amountPaid >= total). */
export function calcChange(total: number, amountPaid: number): number {
  return Math.max(0, amountPaid - total);
}
