import type { Transaction } from "@/entities/transaction";

export interface SalesSummary {
  omzet: number;
  hpp: number;
  grossProfit: number;
  count: number;
}

/** Completed (non-held) sales only. */
const completed = (transactions: Transaction[]) => transactions.filter((t) => t.status === "paid");

export function salesSummary(transactions: Transaction[]): SalesSummary {
  let omzet = 0;
  let netSales = 0;
  let hpp = 0;
  for (const t of completed(transactions)) {
    omzet += t.total;
    netSales += Math.max(0, t.subtotal - t.discountTotal);
    for (const it of t.items) hpp += it.qty * (it.cost ?? 0);
  }
  return { omzet, hpp, grossProfit: netSales - hpp, count: completed(transactions).length };
}

export interface ProductStat {
  name: string;
  qty: number;
  revenue: number;
}

export function topProducts(transactions: Transaction[], limit = 5): ProductStat[] {
  const map = new Map<string, ProductStat>();
  for (const t of completed(transactions)) {
    for (const it of t.items) {
      const e = map.get(it.name) ?? { name: it.name, qty: 0, revenue: 0 };
      e.qty += it.qty;
      e.revenue += it.unitPrice * it.qty - it.discount;
      map.set(it.name, e);
    }
  }
  return [...map.values()].sort((a, b) => b.qty - a.qty).slice(0, limit);
}

export function salesByDay(transactions: Transaction[]): { date: string; total: number }[] {
  const map = new Map<string, number>();
  for (const t of completed(transactions)) {
    const d = t.createdAt.slice(0, 10);
    map.set(d, (map.get(d) ?? 0) + t.total);
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, total]) => ({ date, total }));
}
