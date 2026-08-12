import { expect, test } from "vitest";
import { productToRow, rowToProduct } from "./mappers";
import type { Product } from "@/entities/product";

const product: Product = {
  id: "p1",
  name: "Kopi",
  costPrice: 11_000,
  prices: { umum: 18_000 },
  baseUnit: "pcs",
  units: [],
  categoryId: null,
  stock: 40,
  barcode: "899",
  imagePath: null,
};

test("productToRow flattens the key sellable fields", () => {
  expect(productToRow(product)).toEqual({
    Nama: "Kopi",
    "Harga Jual": 18_000,
    "Harga Beli": 11_000,
    Stok: 40,
    Barcode: "899",
  });
});

test("rowToProduct rebuilds a product from a spreadsheet row", () => {
  const p = rowToProduct({ Nama: "Teh", "Harga Jual": 8_000, "Harga Beli": 4_500, Stok: 12, Barcode: "" });
  expect(p.name).toBe("Teh");
  expect(p.prices.umum).toBe(8_000);
  expect(p.costPrice).toBe(4_500);
  expect(p.stock).toBe(12);
  expect(p.barcode).toBeNull();
  expect(p.baseUnit).toBe("pcs");
});
