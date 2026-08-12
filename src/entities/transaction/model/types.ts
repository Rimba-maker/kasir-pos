export type TransactionStatus = "paid" | "held";
export type PaymentMethod = "cash" | "qris";
/** Accounts-receivable status of a completed sale. */
export type PaymentStatus = "paid" | "partial" | "unpaid";

export interface TransactionItem {
  productId: string;
  /** Snapshot of product name at sale time. */
  name: string;
  /** Snapshot of unit price (integer Rupiah) at sale time. */
  unitPrice: number;
  qty: number;
  /** Per-line discount amount in Rupiah (>= 0). */
  discount: number;
  /** Cost price snapshot at sale time, for profit reporting. */
  cost?: number | null;
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
  /** Cashier shift this sale belongs to, if shifts are in use. */
  shiftId?: string | null;
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
  /** AR status; defaults to "paid" for immediate cash/QRIS sales. */
  paymentStatus?: PaymentStatus;
  /** Amount already paid toward this sale (Rupiah). */
  amountPaid?: number;
  /** Due date for a credit (tempo) sale, ISO date. */
  dueDate?: string | null;
}
