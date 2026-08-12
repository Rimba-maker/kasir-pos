import { beforeEach, expect, test } from "vitest";
import { useCatalogStore } from "@/entities/product";
import { useStockLedgerStore } from "./store";
import { recordStockMovement } from "./record";

beforeEach(() => {
  useStockLedgerStore.setState({ entries: [] });
  useCatalogStore.setState({
    products: [
      { id: "p1", name: "Kopi", costPrice: null, prices: { umum: 10_000 }, baseUnit: "pcs", units: [], categoryId: null, stock: 5, barcode: null, imagePath: null },
    ],
    categories: [],
  });
});

const stockOf = (id: string) => useCatalogStore.getState().products.find((p) => p.id === id)!.stock;

test("a sale movement appends a ledger entry and decrements stock", () => {
  recordStockMovement({ productId: "p1", type: "sale", qty: -2 });

  const entries = useStockLedgerStore.getState().entries;
  expect(entries).toHaveLength(1);
  expect(entries[0].qty).toBe(-2);
  expect(entries[0].type).toBe("sale");
  expect(stockOf("p1")).toBe(3);
});

test("a purchase receipt increments stock and carries unitCost", () => {
  recordStockMovement({ productId: "p1", type: "purchase_receipt", qty: 10, unitCost: 7_000 });

  expect(stockOf("p1")).toBe(15);
  expect(useStockLedgerStore.getState().entries[0].unitCost).toBe(7_000);
});

test("stock never goes below zero", () => {
  recordStockMovement({ productId: "p1", type: "sale", qty: -9 });
  expect(stockOf("p1")).toBe(0);
});

test("every entry gets an id and ISO timestamp", () => {
  const entry = recordStockMovement({ productId: "p1", type: "manual_in", qty: 1 });
  expect(entry.id).toBeTruthy();
  expect(entry.at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
});
