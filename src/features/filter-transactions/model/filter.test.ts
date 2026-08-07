import { expect, test } from "vitest";
import type { Transaction } from "@/entities/transaction";
import { filterTransactions } from "./filter";

const mk = (id: string, iso: string, status: "paid" | "held"): Transaction => ({
  id,
  createdAt: iso,
  cashierId: null,
  customerId: null,
  status,
  items: [],
  discountTotal: 0,
  taxRate: 0,
  subtotal: 0,
  taxTotal: 0,
  total: 0,
  payment: null,
});

// Use midday local to avoid TZ edge flipping the date.
const txs: Transaction[] = [
  mk("a", "2026-08-06T12:00:00", "paid"),
  mk("b", "2026-08-07T12:00:00", "paid"),
  mk("c", "2026-08-07T12:00:00", "held"),
];

test("filters by date range", () => {
  const r = filterTransactions(txs, { from: "2026-08-07", to: "2026-08-07" });
  expect(r.map((t) => t.id)).toEqual(["b", "c"]);
});

test("filters by status", () => {
  const r = filterTransactions(txs, { status: "held" });
  expect(r.map((t) => t.id)).toEqual(["c"]);
});

test("no filter returns all", () => {
  expect(filterTransactions(txs, { status: "all" })).toHaveLength(3);
});
