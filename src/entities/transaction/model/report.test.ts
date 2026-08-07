import { expect, test } from "vitest";
import type { Transaction } from "./types";
import { salesSummary, topProducts } from "./report";

const mk = (id: string, status: "paid" | "held", items: Transaction["items"], total: number): Transaction => ({
  id,
  createdAt: "2026-08-07T00:00:00.000Z",
  cashierId: null,
  customerId: null,
  status,
  items,
  discountTotal: 0,
  taxRate: 0,
  subtotal: total,
  taxTotal: 0,
  total,
  payment: status === "paid" ? { method: "cash", amountPaid: total, change: 0 } : null,
});

const txs: Transaction[] = [
  mk("t1", "paid", [{ productId: "p1", name: "Kopi", unitPrice: 10_000, qty: 2, discount: 0 }], 20_000),
  mk("t2", "paid", [
    { productId: "p1", name: "Kopi", unitPrice: 10_000, qty: 1, discount: 0 },
    { productId: "p2", name: "Teh", unitPrice: 5_000, qty: 3, discount: 0 },
  ], 25_000),
  mk("t3", "held", [{ productId: "p1", name: "Kopi", unitPrice: 10_000, qty: 5, discount: 0 }], 50_000),
];

test("salesSummary counts and sums paid only", () => {
  expect(salesSummary(txs)).toEqual({ count: 2, revenue: 45_000 });
});

test("topProducts ranks by qty across paid transactions (ties keep first-seen)", () => {
  const top = topProducts(txs);
  // p1 and p2 both sold 3; stable sort keeps p1 (seen first) ahead.
  expect(top[0]).toEqual({ productId: "p1", name: "Kopi", qty: 3, revenue: 30_000 });
  expect(top[1]).toEqual({ productId: "p2", name: "Teh", qty: 3, revenue: 15_000 });
  expect(top).toHaveLength(2); // held tx excluded
});
