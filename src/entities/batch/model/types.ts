export interface Batch {
  id: string;
  productId: string;
  batchNo: string | null;
  /** ISO date the batch expires. */
  expiryDate: string;
  /** Remaining quantity, base units. */
  qty: number;
  unitCost: number | null;
}
