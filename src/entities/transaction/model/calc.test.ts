import { expect, test } from "vitest";
import { calcChange, calcTotals, lineTotal } from "./calc";

test("lineTotal applies per-line discount and floors at 0", () => {
  expect(lineTotal({ unitPrice: 10_000, qty: 3, discount: 5_000 })).toBe(25_000);
  expect(lineTotal({ unitPrice: 10_000, qty: 1, discount: 15_000 })).toBe(0);
});

test("calcTotals: no discount, no tax", () => {
  const t = calcTotals({
    items: [
      { unitPrice: 10_000, qty: 2, discount: 0 },
      { unitPrice: 5_000, qty: 1, discount: 0 },
    ],
    discountTotal: 0,
    taxRate: 0,
  });
  expect(t).toEqual({ subtotal: 25_000, taxTotal: 0, total: 25_000 });
});

test("calcTotals: transaction discount applied before tax", () => {
  const t = calcTotals({
    items: [{ unitPrice: 100_000, qty: 1, discount: 0 }],
    discountTotal: 10_000,
    taxRate: 0.11,
  });
  // taxable 90_000 -> tax 9_900 -> total 99_900
  expect(t).toEqual({ subtotal: 100_000, taxTotal: 9_900, total: 99_900 });
});

test("calcTotals: tax rounds to whole Rupiah", () => {
  const t = calcTotals({
    items: [{ unitPrice: 3_333, qty: 1, discount: 0 }],
    discountTotal: 0,
    taxRate: 0.11,
  });
  expect(t.taxTotal).toBe(367); // 366.63 -> 367
  expect(t.total).toBe(3_700);
});

test("calcTotals: discount larger than subtotal clamps taxable to 0", () => {
  const t = calcTotals({
    items: [{ unitPrice: 10_000, qty: 1, discount: 0 }],
    discountTotal: 50_000,
    taxRate: 0.11,
  });
  expect(t).toEqual({ subtotal: 10_000, taxTotal: 0, total: 0 });
});

test("calcChange", () => {
  expect(calcChange(27_000, 50_000)).toBe(23_000);
  expect(calcChange(27_000, 27_000)).toBe(0);
  expect(calcChange(27_000, 20_000)).toBe(0); // underpay guarded elsewhere
});
