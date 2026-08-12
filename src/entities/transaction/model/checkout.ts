import { calcTotals } from "./calc";
import type { CartLine } from "./cart";
import type { Payment, Transaction, TransactionStatus } from "./types";

export interface BuildTransactionInput {
  lines: CartLine[];
  discountTotal: number;
  taxRate: number;
  taxInclusive?: boolean;
  status: TransactionStatus;
  payment: Payment | null;
  cashierId?: string | null;
  customerId?: string | null;
  shiftId?: string | null;
  /** Paid now; defaults to the full total (immediate sale). Less = credit sale. */
  amountPaid?: number;
  dueDate?: string | null;
  /** Overridable for deterministic tests. */
  id?: string;
  createdAt?: string;
}

/** Build a persistable Transaction from a cart snapshot. Pure (id/date injectable). */
export function buildTransaction(input: BuildTransactionInput): Transaction {
  const { lines, discountTotal, taxRate, taxInclusive } = input;
  const totals = calcTotals({ items: lines, discountTotal, taxRate, taxInclusive });
  const amountPaid = input.amountPaid ?? totals.total;
  const paymentStatus = amountPaid >= totals.total ? "paid" : amountPaid > 0 ? "partial" : "unpaid";
  return {
    id: input.id ?? crypto.randomUUID(),
    createdAt: input.createdAt ?? new Date().toISOString(),
    cashierId: input.cashierId ?? null,
    customerId: input.customerId ?? null,
    shiftId: input.shiftId ?? null,
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
    paymentStatus,
    amountPaid,
    dueDate: input.dueDate ?? null,
  };
}
