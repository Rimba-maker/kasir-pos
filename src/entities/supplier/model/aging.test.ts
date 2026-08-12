import { expect, test } from "vitest";
import { agingBuckets, applyFifoPayments, type Payable } from "./aging";

const payables: Payable[] = [
  { id: "a", amount: 100_000, dueDate: "2026-01-01" },
  { id: "b", amount: 50_000, dueDate: "2026-02-01" },
];

test("applyFifoPayments settles the oldest due date first", () => {
  const r = applyFifoPayments(payables, 120_000);
  expect(r.find((x) => x.id === "a")!.remaining).toBe(0);
  expect(r.find((x) => x.id === "b")!.remaining).toBe(30_000);
});

test("applyFifoPayments leaves everything owed when nothing is paid", () => {
  const r = applyFifoPayments(payables, 0);
  expect(r.map((x) => x.remaining)).toEqual([100_000, 50_000]);
});

test("agingBuckets places overdue debt in the right bucket", () => {
  // a (2026-01-01) is 59 days before asOf → 31-60; b (2026-02-01) is 28 days → 1-30
  const b = agingBuckets(payables, 0, new Date("2026-03-01"));
  expect(b.d31_60).toBe(100_000);
  expect(b.d1_30).toBe(50_000);
  expect(b.total).toBe(150_000);
});

test("agingBuckets counts not-yet-due debt as current", () => {
  const b = agingBuckets([{ id: "c", amount: 20_000, dueDate: "2026-12-31" }], 0, new Date("2026-06-01"));
  expect(b.current).toBe(20_000);
  expect(b.total).toBe(20_000);
});

test("agingBuckets excludes fully-paid debt", () => {
  const b = agingBuckets(payables, 150_000, new Date("2026-03-01"));
  expect(b.total).toBe(0);
});
