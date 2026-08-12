import { recordStockMovement } from "@/entities/stock-ledger";
import { usePurchaseStore } from "./store";
import type { SupplierReturn, SupplierReturnLine } from "./types";

/**
 * Return goods to a supplier: record the return, drop stock via a
 * purchase_return ledger movement (#3). Its value reduces the supplier's
 * debt (see supplierReturnsValue).
 */
export function returnPurchase(input: {
  supplierId: string;
  poId?: string | null;
  receiptId?: string | null;
  reason?: string | null;
  lines: SupplierReturnLine[];
}): SupplierReturn {
  const ret: SupplierReturn = {
    id: crypto.randomUUID(),
    supplierId: input.supplierId,
    poId: input.poId ?? null,
    receiptId: input.receiptId ?? null,
    at: new Date().toISOString(),
    reason: input.reason ?? null,
    lines: input.lines.filter((l) => l.qty > 0),
  };
  usePurchaseStore.getState().addReturn(ret);
  for (const l of ret.lines) {
    recordStockMovement({
      productId: l.productId,
      type: "purchase_return",
      qty: -l.qty,
      unitCost: l.unitCost,
      batchId: l.batchId ?? null,
      refType: "supplier_return",
      refId: ret.id,
    });
  }
  return ret;
}

/** Total returned value for a supplier — reduces its outstanding debt. */
export function supplierReturnsValue(returns: SupplierReturn[], supplierId: string): number {
  return returns
    .filter((r) => r.supplierId === supplierId)
    .reduce((sum, r) => sum + r.lines.reduce((s, l) => s + l.qty * l.unitCost, 0), 0);
}
