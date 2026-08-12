export type POStatus = "draft" | "ordered" | "partial" | "completed";

export interface POLine {
  productId: string;
  /** Ordering unit label (e.g. "box"). */
  unitName: string;
  /** Quantity in the ordering unit. */
  qty: number;
  /** Cost per one ordering unit, integer Rupiah. */
  unitCost: number;
  /** Quantity converted to base units (qty × factor), stored at creation. */
  baseQty: number;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  /** Persisted lifecycle flag; partial/completed are derived from receipts. */
  status: "draft" | "ordered";
  createdAt: string;
  /** ISO date payment falls due; drives supplier aging. */
  dueDate: string | null;
  lines: POLine[];
}

export interface GoodsReceiptLine {
  productId: string;
  /** Quantity received, in BASE units. */
  qty: number;
  /** Cost per BASE unit, integer Rupiah. */
  unitCost: number;
}

export interface GoodsReceipt {
  id: string;
  poId: string;
  at: string;
  lines: GoodsReceiptLine[];
}

export interface SupplierReturnLine {
  productId: string;
  batchId?: string | null;
  /** Quantity returned, BASE units. */
  qty: number;
  /** Cost per BASE unit (reduces supplier debt). */
  unitCost: number;
}

export interface SupplierReturn {
  id: string;
  supplierId: string;
  poId: string | null;
  receiptId: string | null;
  at: string;
  reason: string | null;
  lines: SupplierReturnLine[];
}
