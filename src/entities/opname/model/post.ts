import { useCatalogStore } from "@/entities/product";
import { recordStockMovement } from "@/entities/stock-ledger";
import { useOpnameStore } from "./store";
import type { OpnameLine, StockOpname } from "./types";

/**
 * Post a stock-take: for each line, the difference against the system stock
 * *at posting time* becomes an opname_adjust ledger movement (#3), so stock
 * matches the physical count. Lines with no difference produce no movement.
 */
export function postOpname(
  lines: OpnameLine[],
  opts: { byStaffId?: string | null; note?: string | null } = {},
): StockOpname {
  const products = useCatalogStore.getState().products;
  for (const l of lines) {
    const product = products.find((p) => p.id === l.productId);
    if (!product) continue;
    const diff = Math.round(l.countedQty) - product.stock;
    if (diff !== 0) {
      recordStockMovement({
        productId: l.productId,
        type: "opname_adjust",
        qty: diff,
        unitCost: product.costPrice,
        refType: "opname",
        note: opts.note ?? null,
      });
    }
  }
  const opname: StockOpname = {
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    byStaffId: opts.byStaffId ?? null,
    note: opts.note ?? null,
    lines: lines.map((l) => ({ productId: l.productId, countedQty: Math.round(l.countedQty) })),
  };
  useOpnameStore.getState().add(opname);
  return opname;
}
