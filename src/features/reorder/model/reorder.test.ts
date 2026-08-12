import { expect, test } from "vitest";
import type { Product } from "@/entities/product";
import { buildReorderDrafts, lowStockProducts } from "./reorder";

const make = (over: Partial<Product>): Product => ({
  id: "x",
  name: "P",
  costPrice: 6_000,
  prices: { umum: 10_000 },
  baseUnit: "pcs",
  units: [],
  categoryId: null,
  stock: 0,
  barcode: null,
  imagePath: null,
  ...over,
});

const products = [
  make({ id: "p1", stock: 3, reorderPoint: 5, reorderQty: 20, defaultSupplierId: "s1" }),
  make({ id: "p2", stock: 10, reorderPoint: 5, defaultSupplierId: "s1" }), // not low
  make({ id: "p3", stock: 0, reorderPoint: 2, reorderQty: 12, defaultSupplierId: "s1" }),
  make({ id: "p4", stock: 1, reorderPoint: 3, reorderQty: 5, defaultSupplierId: "s2" }),
  make({ id: "p5", stock: 0, reorderPoint: 2 }), // low but no supplier
];

test("lowStockProducts flags stock at or below the reorder point", () => {
  expect(lowStockProducts(products).map((p) => p.id)).toEqual(["p1", "p3", "p4", "p5"]);
});

test("buildReorderDrafts groups low stock into one draft per supplier", () => {
  const drafts = buildReorderDrafts(products);
  expect(drafts).toHaveLength(2); // s1 and s2; p5 (no supplier) skipped
  const s1 = drafts.find((d) => d.supplierId === "s1")!;
  expect(s1.lines.map((l) => l.productId)).toEqual(["p1", "p3"]);
  expect(s1.lines[0].qty).toBe(20); // fixed reorderQty
});

test("buildReorderDrafts falls back to topping up to the reorder point", () => {
  const drafts = buildReorderDrafts([make({ id: "q", stock: 1, reorderPoint: 5, defaultSupplierId: "s3" })]);
  expect(drafts[0].lines[0].qty).toBe(4); // 5 − 1
});
