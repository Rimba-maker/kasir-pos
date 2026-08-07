import { beforeEach, expect, test } from "vitest";
import { cartTotals, useCartStore } from "./cart";

beforeEach(() => useCartStore.getState().clear());

const s = () => useCartStore.getState();

test("addItem merges quantity for the same product", () => {
  s().addItem({ id: "p1", name: "Kopi", price: 10_000 });
  s().addItem({ id: "p1", name: "Kopi", price: 10_000 }, 2);
  expect(s().lines).toHaveLength(1);
  expect(s().lines[0].qty).toBe(3);
});

test("changeQty removes the line when it hits zero", () => {
  s().addItem({ id: "p1", name: "Kopi", price: 10_000 });
  s().changeQty("p1", -1);
  expect(s().lines).toHaveLength(0);
});

test("setQty to 0 drops the line", () => {
  s().addItem({ id: "p1", name: "Kopi", price: 10_000 }, 5);
  s().setQty("p1", 0);
  expect(s().lines).toHaveLength(0);
});

test("cartTotals reflects lines, discount and tax", () => {
  s().addItem({ id: "p1", name: "Kopi", price: 10_000 }, 2);
  s().addItem({ id: "p2", name: "Teh", price: 5_000 });
  s().setDiscountTotal(5_000);
  s().setTaxRate(0.11);
  // subtotal 25_000, taxable 20_000, tax 2_200, total 22_200
  expect(cartTotals(s())).toEqual({ subtotal: 25_000, taxTotal: 2_200, total: 22_200 });
});

test("discount and tax clamp to non-negative", () => {
  s().setDiscountTotal(-100);
  s().setTaxRate(-0.5);
  expect(s().discountTotal).toBe(0);
  expect(s().taxRate).toBe(0);
});
