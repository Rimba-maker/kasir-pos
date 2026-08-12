import { expect, test } from "vitest";
import { applicablePromo, promoDiscount, type CartLineLite } from "./engine";
import type { Promo } from "./types";

const promo = (over: Partial<Promo>): Promo => ({ id: "x", name: "P", active: true, type: "percent", ...over });
const lines: CartLineLite[] = [
  { productId: "a", unitPrice: 10_000, qty: 12 },
  { productId: "b", unitPrice: 5_000, qty: 1 },
];

test("percent off the whole cart", () => {
  expect(promoDiscount(promo({ type: "percent", percent: 0.1 }), lines)).toBe(12_500); // 10% of 125k
});

test("qty_break gives a per-unit discount once the minimum is met", () => {
  expect(promoDiscount(promo({ type: "qty_break", productId: "a", minQty: 12, amount: 500 }), lines)).toBe(6_000);
  expect(promoDiscount(promo({ type: "qty_break", productId: "a", minQty: 20, amount: 500 }), lines)).toBe(0);
});

test("buy_x_get_y frees whole sets of units", () => {
  const l: CartLineLite[] = [{ productId: "a", unitPrice: 10_000, qty: 6 }];
  expect(promoDiscount(promo({ type: "buy_x_get_y", productId: "a", minQty: 3, freeQty: 1 }), l)).toBe(20_000); // 2 sets → 2 free
});

test("bundle needs all products present", () => {
  expect(promoDiscount(promo({ type: "bundle", productIds: ["a", "b"], amount: 5_000 }), lines)).toBe(5_000);
  expect(promoDiscount(promo({ type: "bundle", productIds: ["a", "c"], amount: 5_000 }), lines)).toBe(0);
});

test("applicablePromo picks the single best and ignores inactive/out-of-window", () => {
  const promos: Promo[] = [
    promo({ id: "p1", type: "percent", percent: 0.1 }), // 12_500
    promo({ id: "p2", type: "nominal", amount: 20_000 }), // 20_000 (best)
    promo({ id: "p3", type: "nominal", amount: 50_000, active: false }), // ignored
    promo({ id: "p4", type: "percent", percent: 0.5, endAt: "2020-01-01" }), // expired
  ];
  const best = applicablePromo(promos, lines, new Date("2026-06-01"));
  expect(best?.promo.id).toBe("p2");
  expect(best?.discount).toBe(20_000);
});
