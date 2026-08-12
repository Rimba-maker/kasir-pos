export type StockMovementType =
  | "sale"
  | "sale_return"
  | "purchase_receipt"
  | "purchase_return"
  | "opname_adjust"
  | "manual_in"
  | "manual_out";

export interface StockLedgerEntry {
  id: string;
  productId: string;
  /** ISO timestamp. */
  at: string;
  type: StockMovementType;
  /** Signed, in base unit: positive = in, negative = out. */
  qty: number;
  /** Unit cost at movement time (valuation/FEFO). Null until known. */
  unitCost?: number | null;
  /** What produced this entry, e.g. "transaction" | "purchase_order" | "opname". */
  refType?: string | null;
  refId?: string | null;
  batchId?: string | null;
  note?: string | null;
  staffId?: string | null;
  shiftId?: string | null;
}
