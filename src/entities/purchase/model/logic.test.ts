import { expect, test } from "vitest";
import { poPayables, poStatus, receiptValue } from "./logic";
import type { GoodsReceipt, PurchaseOrder } from "./types";

const po = (over: Partial<PurchaseOrder> = {}): PurchaseOrder => ({
  id: "po1",
  supplierId: "s1",
  status: "ordered",
  createdAt: "2026-01-01",
  dueDate: "2026-02-01",
  lines: [{ productId: "p1", unitName: "box", qty: 2, unitCost: 120_000, baseQty: 24 }],
  ...over,
});

const receipt = (qty: number): GoodsReceipt => ({
  id: "r1",
  poId: "po1",
  at: "2026-01-05",
  lines: [{ productId: "p1", qty, unitCost: 5_000 }],
});

test("poStatus: draft stays draft", () => {
  expect(poStatus(po({ status: "draft" }), [])).toBe("draft");
});

test("poStatus: ordered with no receipts", () => {
  expect(poStatus(po(), [])).toBe("ordered");
});

test("poStatus: partial then completed by received quantity", () => {
  expect(poStatus(po(), [receipt(10)])).toBe("partial");
  expect(poStatus(po(), [receipt(24)])).toBe("completed");
});

test("receiptValue sums base qty × base cost", () => {
  expect(receiptValue(receipt(24).lines)).toBe(120_000);
});

test("poPayables makes one due-dated payable per receipt", () => {
  const p = poPayables([po()], [receipt(24)]);
  expect(p).toEqual([{ id: "r1", amount: 120_000, dueDate: "2026-02-01" }]);
});
