import { expect, test } from "vitest";
import type { Product } from "./types";
import { groupProducts, skuInUse, variantLabel } from "./variants";

const p = (over: Partial<Product>): Product => ({
  id: "p",
  name: "Produk",
  costPrice: null,
  prices: { umum: 1000 },
  baseUnit: "pcs",
  units: [],
  categoryId: null,
  stock: 0,
  barcode: null,
  imagePath: null,
  ...over,
});

test("variantLabel appends the variant name only when present", () => {
  expect(variantLabel(p({ name: "Kaos", variantName: "Merah / L" }))).toBe("Kaos — Merah / L");
  expect(variantLabel(p({ name: "Kaos" }))).toBe("Kaos");
  expect(variantLabel(p({ name: "Kaos", variantName: "  " }))).toBe("Kaos");
});

test("groupProducts collapses same variantGroup at the first member's position", () => {
  const products = [
    p({ id: "a", variantGroup: "Kaos", variantName: "Merah" }),
    p({ id: "b" }), // standalone between members
    p({ id: "c", variantGroup: "Kaos", variantName: "Biru" }),
  ];
  const entries = groupProducts(products);
  expect(entries).toHaveLength(2);
  expect(entries[0]).toMatchObject({ kind: "group", group: "Kaos" });
  expect((entries[0] as { members: Product[] }).members.map((m) => m.id)).toEqual(["a", "c"]);
  expect(entries[1]).toMatchObject({ kind: "single" });
});

test("skuInUse ignores self, blanks, and is case-insensitive", () => {
  const products = [p({ id: "a", sku: "KAOS-01" }), p({ id: "b", sku: null })];
  expect(skuInUse(products, "kaos-01")).toBe(true);
  expect(skuInUse(products, "KAOS-01", "a")).toBe(false); // editing itself
  expect(skuInUse(products, "  ")).toBe(false);
  expect(skuInUse(products, "NEW-99")).toBe(false);
});
