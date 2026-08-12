import { expect, test } from "vitest";
import { expiredBatches, pickFefo } from "./fefo";
import { consumeBatchesFefo, useBatchStore } from "./store";
import type { Batch } from "./types";

const batches: Batch[] = [
  { id: "b-late", productId: "p1", batchNo: null, expiryDate: "2026-06-01", qty: 10, unitCost: null },
  { id: "b-early", productId: "p1", batchNo: null, expiryDate: "2026-03-01", qty: 4, unitCost: null },
];

test("pickFefo takes the earliest-expiring batch first", () => {
  const { allocations, short } = pickFefo(batches, 6);
  expect(allocations).toEqual([
    { batchId: "b-early", take: 4 },
    { batchId: "b-late", take: 2 },
  ]);
  expect(short).toBe(0);
});

test("pickFefo reports a shortfall when batches run out", () => {
  const { short } = pickFefo(batches, 20);
  expect(short).toBe(6);
});

test("expiredBatches finds stock past its expiry date", () => {
  const e = expiredBatches(batches, new Date("2026-04-01"));
  expect(e.map((b) => b.id)).toEqual(["b-early"]);
});

test("consumeBatchesFefo decrements batches oldest-expiry first", () => {
  useBatchStore.setState({ batches: batches.map((b) => ({ ...b })) });
  const short = consumeBatchesFefo("p1", 6);
  expect(short).toBe(0);
  const after = useBatchStore.getState().batches;
  expect(after.find((b) => b.id === "b-early")!.qty).toBe(0);
  expect(after.find((b) => b.id === "b-late")!.qty).toBe(8);
});
