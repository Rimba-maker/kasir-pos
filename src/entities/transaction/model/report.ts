import { lineTotal } from "./calc";
import type { Transaction } from "./types";

export interface SalesSummary {
  /** Count of paid transactions. */
  count: number;
  /** Sum of paid transaction totals (omzet). */
  revenue: number;
}

/** Summary over paid transactions only (held sales don't count as revenue). */
export function salesSummary(txs: Transaction[]): SalesSummary {
  const paid = txs.filter((t) => t.status === "paid");
  return {
    count: paid.length,
    revenue: paid.reduce((sum, t) => sum + t.total, 0),
  };
}

export interface TopProduct {
  productId: string;
  name: string;
  qty: number;
  revenue: number;
}

/** Best sellers by quantity, from paid transactions. */
export function topProducts(txs: Transaction[], limit = 5): TopProduct[] {
  const acc = new Map<string, TopProduct>();
  for (const t of txs) {
    if (t.status !== "paid") continue;
    for (const item of t.items) {
      const cur = acc.get(item.productId) ?? {
        productId: item.productId,
        name: item.name,
        qty: 0,
        revenue: 0,
      };
      cur.qty += item.qty;
      cur.revenue += lineTotal(item);
      acc.set(item.productId, cur);
    }
  }
  return [...acc.values()].sort((a, b) => b.qty - a.qty).slice(0, limit);
}
