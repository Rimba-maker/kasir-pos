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

const txProfit = (t: Transaction): number => {
  const net = Math.max(0, t.subtotal - t.discountTotal);
  let cost = 0;
  for (const it of t.items) cost += it.qty * (it.cost ?? 0);
  return net - cost;
};

/** Daily revenue + gross profit, sorted by date (for the trend chart). */
export function salesByDay(transactions: Transaction[]): { date: string; total: number; profit: number }[] {
  const map = new Map<string, { total: number; profit: number }>();
  for (const t of completed(transactions)) {
    const d = t.createdAt.slice(0, 10);
    const e = map.get(d) ?? { total: 0, profit: 0 };
    e.total += t.total;
    e.profit += txProfit(t);
    map.set(d, e);
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, v]) => ({ date, ...v }));
}

/** Revenue + count bucketed by local hour-of-day (peak-hours), only hours with sales. */
export function salesByHour(transactions: Transaction[]): { hour: number; label: string; total: number; count: number }[] {
  const map = new Map<number, { total: number; count: number }>();
  for (const t of completed(transactions)) {
    const h = new Date(t.createdAt).getHours();
    const e = map.get(h) ?? { total: 0, count: 0 };
    e.total += t.total;
    e.count += 1;
    map.set(h, e);
  }
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([hour, v]) => ({ hour, label: `${String(hour).padStart(2, "0")}:00`, ...v }));
}

/** Revenue + count grouped by payment method, biggest first (for the donut). */
export function paymentBreakdown(transactions: Transaction[]): { method: string; total: number; count: number }[] {
  const map = new Map<string, { total: number; count: number }>();
  for (const t of completed(transactions)) {
    const m = t.payment?.method ?? "lainnya";
    const e = map.get(m) ?? { total: 0, count: 0 };
    e.total += t.total;
    e.count += 1;
    map.set(m, e);
  }
  return [...map.entries()]
    .sort((a, b) => b[1].total - a[1].total)
    .map(([method, v]) => ({ method, ...v }));
}
