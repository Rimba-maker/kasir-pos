import { expect, test } from "vitest";
import type { Transaction } from "@/entities/transaction";
import { salesByDay, salesSummary, topProducts } from "./reporting";

const tx = (over: Partial<Transaction>): Transaction => ({
  id: "t",
  createdAt: "2026-01-01",
  cashierId: null,
  customerId: null,
  status: "paid",
  items: [],
  discountTotal: 0,
  taxRate: 0,
  subtotal: 0,
  taxTotal: 0,
  total: 0,
  payment: null,
  ...over,
});

const transactions = [
  tx({
    id: "a",
    createdAt: "2026-01-01T09:00:00Z",
    subtotal: 100_000,
    total: 100_000,
    items: [{ productId: "p1", name: "Kopi", unitPrice: 20_000, qty: 5, discount: 0, cost: 11_000 }],
  }),
  tx({
    id: "b",
    createdAt: "2026-01-02T09:00:00Z",
    subtotal: 40_000,
    total: 40_000,
    items: [{ productId: "p2", name: "Teh", unitPrice: 8_000, qty: 5, discount: 0, cost: 4_500 }],
  }),
  tx({ id: "held", status: "held", total: 999_999 }), // excluded
];

test("salesSummary sums revenue, COGS and gross profit for completed sales", () => {
  const s = salesSummary(transactions);
  expect(s.omzet).toBe(140_000);
  expect(s.hpp).toBe(5 * 11_000 + 5 * 4_500); // 77_500
  expect(s.grossProfit).toBe(140_000 - 77_500);
  expect(s.count).toBe(2);
});

test("topProducts ranks by quantity", () => {
  const top = topProducts(transactions);
  expect(top[0].name).toBe("Kopi");
  expect(top[0].qty).toBe(5);
});

test("salesByDay buckets totals by date", () => {
  expect(salesByDay(transactions)).toEqual([
    { date: "2026-01-01", total: 100_000 },
    { date: "2026-01-02", total: 40_000 },
  ]);
});
