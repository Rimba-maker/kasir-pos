import { calcTotals } from "./calc";
import type { CartLine } from "./cart";
import type { Payment, Transaction, TransactionStatus } from "./types";

export interface BuildTransactionInput {
  lines: CartLine[];
  discountTotal: number;
  taxRate: number;
  status: TransactionStatus;
  payment: Payment | null;
  cashierId?: string | null;
  customerId?: string | null;
  /** Overridable for deterministic tests. */
  id?: string;
  createdAt?: string;
}

/** Build a persistable Transaction from a cart snapshot. Pure (id/date injectable). */
export function buildTransaction(input: BuildTransactionInput): Transaction {
  const { lines, discountTotal, taxRate } = input;
  const totals = calcTotals({ items: lines, discountTotal, taxRate });
  return {
    id: input.id ?? crypto.randomUUID(),
    createdAt: input.createdAt ?? new Date().toISOString(),
    cashierId: input.cashierId ?? null,
    customerId: input.customerId ?? null,
    status: input.status,
    items: lines.map((l) => ({
      productId: l.productId,
      name: l.name,
      unitPrice: l.unitPrice,
      qty: l.qty,
      discount: l.discount,
    })),
    discountTotal,
    taxRate,
    subtotal: totals.subtotal,
    taxTotal: totals.taxTotal,
    total: totals.total,
    payment: input.payment,
  };
}
