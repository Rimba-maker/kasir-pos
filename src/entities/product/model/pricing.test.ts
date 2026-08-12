import { expect, test } from "vitest";
import { DEFAULT_TIER, sellPrice } from "./pricing";

const p = { prices: { umum: 10_000, grosir: 8_500 } };

test("returns the price for a given tier", () => {
  expect(sellPrice(p, "grosir")).toBe(8_500);
});

test("defaults to the umum tier", () => {
  expect(sellPrice(p)).toBe(10_000);
  expect(DEFAULT_TIER).toBe("umum");
});

test("falls back to umum for an unknown tier", () => {
  expect(sellPrice(p, "reseller")).toBe(10_000);
});

test("returns 0 when no price is set", () => {
  expect(sellPrice({ prices: {} })).toBe(0);
});
