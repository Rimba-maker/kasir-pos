import { beforeEach, expect, test } from "vitest";
import { useCatalogStore } from "@/entities/product";
import { useStockLedgerStore } from "@/entities/stock-ledger";
import { usePurchaseStore } from "./store";
import { returnPurchase, supplierReturnsValue } from "./return";

beforeEach(() => {
  useStockLedgerStore.setState({ entries: [] });
  usePurchaseStore.setState({ orders: [], receipts: [], returns: [] });
  useCatalogStore.setState({
    products: [
      { id: "p1", name: "Kopi", costPrice: 6_000, prices: { umum: 10_000 }, baseUnit: "pcs", units: [], categoryId: null, stock: 20, barcode: null, imagePath: null },
    ],
    categories: [],
  });
});

test("returning goods drops stock and logs a purchase_return", () => {
  returnPurchase({ supplierId: "s1", lines: [{ productId: "p1", qty: 5, unitCost: 6_000 }] });

  expect(useCatalogStore.getState().products[0].stock).toBe(15);
  const entry = useStockLedgerStore.getState().entries[0];
  expect(entry.type).toBe("purchase_return");
  expect(entry.qty).toBe(-5);
  expect(usePurchaseStore.getState().returns).toHaveLength(1);
});

test("supplierReturnsValue sums a supplier's returned value", () => {
  returnPurchase({ supplierId: "s1", lines: [{ productId: "p1", qty: 5, unitCost: 6_000 }] });
  const returns = usePurchaseStore.getState().returns;
  expect(supplierReturnsValue(returns, "s1")).toBe(30_000);
  expect(supplierReturnsValue(returns, "s2")).toBe(0);
});
