export type TransactionStatus = "paid" | "held";
export type PaymentMethod = "cash" | "qris";

export interface TransactionItem {
  productId: string;
  /** Snapshot of product name at sale time. */
  name: string;
  /** Snapshot of unit price (integer Rupiah) at sale time. */
  unitPrice: number;
  qty: number;
  /** Per-line discount amount in Rupiah (>= 0). */
  discount: number;
}

export interface Payment {
  method: PaymentMethod;
  /** Cash tendered, or QRIS nominal. */
  amountPaid: number;
  /** Cash change; 0 for QRIS. */
  change: number;
}

export interface Transaction {
  id: string;
  /** ISO 8601. */
  createdAt: string;
  cashierId: string | null;
  customerId: string | null;
  status: TransactionStatus;
  items: TransactionItem[];
  /** Transaction-level discount in Rupiah (>= 0). */
  discountTotal: number;
  /** Tax rate 0..1; 0 when tax is disabled. */
  taxRate: number;
  // Persisted computed fields (for reporting without recompute):
  subtotal: number;
  taxTotal: number;
  total: number;
  /** null while the transaction is held/unpaid. */
  payment: Payment | null;
}
