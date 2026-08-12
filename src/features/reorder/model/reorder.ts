import type { Product } from "@/entities/product";
import type { POLine } from "@/entities/purchase";

/** Products at or below their reorder point (those that have one set). */
export function lowStockProducts(products: Product[]): Product[] {
  return products.filter((p) => p.reorderPoint != null && p.stock <= p.reorderPoint);
}

export interface ReorderDraft {
  supplierId: string;
  lines: POLine[];
}

/** How much to reorder: the fixed reorderQty, else top up to the reorder point. */
function reorderAmount(p: Product): number {
  if (p.reorderQty && p.reorderQty > 0) return Math.round(p.reorderQty);
  return Math.max(1, (p.reorderPoint ?? 0) - p.stock);
}

/**
 * Group low-stock products with a preferred supplier into one draft PO per
 * supplier. Products without a defaultSupplierId are skipped (can't order).
 */
export function buildReorderDrafts(products: Product[]): ReorderDraft[] {
  const bySupplier = new Map<string, POLine[]>();
  for (const p of lowStockProducts(products)) {
    if (!p.defaultSupplierId) continue;
    const qty = reorderAmount(p);
    const line: POLine = {
      productId: p.id,
      unitName: p.baseUnit,
      qty,
      unitCost: p.costPrice ?? 0,
      baseQty: qty,
    };
    const list = bySupplier.get(p.defaultSupplierId) ?? [];
    list.push(line);
    bySupplier.set(p.defaultSupplierId, list);
  }
  return [...bySupplier.entries()].map(([supplierId, lines]) => ({ supplierId, lines }));
}
