import { expect, test } from "vitest";
import { reconcileShift } from "./reconcile";

test("expected cash adds sales and petty-cash-in, subtracts petty-cash-out", () => {
  const r = reconcileShift({
    openingCash: 100_000,
    cashSalesTotal: 500_000,
    cashIn: 20_000,
    cashOut: 30_000,
    counted: 590_000,
  });
  expect(r.expected).toBe(590_000);
  expect(r.variance).toBe(0);
});

test("variance is positive on surplus, negative when short", () => {
  expect(reconcileShift({ openingCash: 100_000, cashSalesTotal: 0, cashIn: 0, cashOut: 0, counted: 110_000 }).variance).toBe(10_000);
  expect(reconcileShift({ openingCash: 100_000, cashSalesTotal: 0, cashIn: 0, cashOut: 0, counted: 90_000 }).variance).toBe(-10_000);
});
