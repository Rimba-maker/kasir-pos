import { expect, test } from "vitest";
import { toBaseQty, unitSellPrice } from "./units";

const p = {
  prices: { umum: 10_000, grosir: 9_000 },
  units: [
    { name: "box", factor: 12 },
    { name: "paket", factor: 12, prices: { umum: 100_000 } },
  ],
};

test("toBaseQty multiplies by the unit factor", () => {
  expect(toBaseQty(p, "box", 2)).toBe(24);
});

test("toBaseQty treats an unknown unit as base (factor 1)", () => {
  expect(toBaseQty(p, "pcs", 3)).toBe(3);
});

test("unitSellPrice falls back to factor × base price", () => {
  expect(unitSellPrice(p, "box")).toBe(120_000); // 12 × 10_000
  expect(unitSellPrice(p, "box", "grosir")).toBe(108_000); // 12 × 9_000
});

test("unitSellPrice uses the unit's own override when set", () => {
  expect(unitSellPrice(p, "paket")).toBe(100_000);
});

test("unitSellPrice for an unknown unit is the base price", () => {
  expect(unitSellPrice(p, "pcs")).toBe(10_000);
});
