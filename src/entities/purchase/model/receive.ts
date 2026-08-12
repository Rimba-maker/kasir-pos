import { useCatalogStore } from "@/entities/product";
import { recordStockMovement } from "@/entities/stock-ledger";
import { usePurchaseStore } from "./store";
import type { GoodsReceipt, GoodsReceiptLine, PurchaseOrder } from "./types";

/**
 * Post a goods receipt for a PO: record the receipt, raise stock via the
 * ledger choke-point (#3), and set each product's cost price to the latest
 * purchase. The supplier payable is derived from receipts (see poPayables).
 */
export function receivePurchase(po: PurchaseOrder, lines: GoodsReceiptLine[]): GoodsReceipt {
  const receipt: GoodsReceipt = {
    id: crypto.randomUUID(),
    poId: po.id,
    at: new Date().toISOString(),
    lines: lines.filter((l) => l.qty > 0),
  };
  usePurchaseStore.getState().addReceipt(receipt);
  for (const l of receipt.lines) {
    recordStockMovement({
      productId: l.productId,
      type: "purchase_receipt",
      qty: l.qty,
      unitCost: l.unitCost,
      refType: "purchase_order",
      refId: po.id,
    });
    useCatalogStore.setState((s) => ({
      products: s.products.map((p) => (p.id === l.productId ? { ...p, costPrice: l.unitCost } : p)),
    }));
  }
  return receipt;
}
