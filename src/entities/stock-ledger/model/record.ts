import { useCatalogStore } from "@/entities/product";
import { useStockLedgerStore } from "./store";
import type { StockLedgerEntry, StockMovementType } from "./types";

export interface StockMovementInput {
  productId: string;
  type: StockMovementType;
  /** Signed, base unit: positive = in, negative = out. */
  qty: number;
  unitCost?: number | null;
  refType?: string | null;
  refId?: string | null;
  batchId?: string | null;
  note?: string | null;
  staffId?: string | null;
  shiftId?: string | null;
}

/**
 * The single choke-point for every stock change: append a ledger entry AND
 * update product.stock together. Every caller — sale, PO receipt, opname,
 * manual in/out — routes here, so stock and its history can never diverge.
 */
export function recordStockMovement(input: StockMovementInput): StockLedgerEntry {
  const entry: StockLedgerEntry = {
    unitCost: null,
    refType: null,
    refId: null,
    batchId: null,
    note: null,
    staffId: null,
    shiftId: null,
    ...input,
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
  };

  useStockLedgerStore.getState().append(entry);
  useCatalogStore.setState((s) => ({
    products: s.products.map((p) =>
      p.id === entry.productId ? { ...p, stock: Math.max(0, p.stock + entry.qty) } : p,
    ),
  }));

  return entry;
}
