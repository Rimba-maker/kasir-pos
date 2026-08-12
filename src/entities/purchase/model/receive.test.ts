import { beforeEach, expect, test } from "vitest";
import { useCatalogStore } from "@/entities/product";
import { useStockLedgerStore } from "@/entities/stock-ledger";
import { usePurchaseStore } from "./store";
import { receivePurchase } from "./receive";
import type { PurchaseOrder } from "./types";

const po: PurchaseOrder = {
  id: "po1",
  supplierId: "s1",
  status: "ordered",
  createdAt: "2026-01-01",
  dueDate: null,
  lines: [{ productId: "p1", unitName: "box", qty: 1, unitCost: 120_000, baseQty: 20 }],
};

beforeEach(() => {
  useStockLedgerStore.setState({ entries: [] });
  usePurchaseStore.setState({ orders: [], receipts: [] });
  useCatalogStore.setState({
    products: [
      { id: "p1", name: "Kopi", costPrice: null, prices: { umum: 10_000 }, baseUnit: "pcs", units: [], categoryId: null, stock: 5, barcode: null, imagePath: null },
    ],
    categories: [],
  });
});

test("receiving raises stock, logs the ledger, and updates cost price", () => {
  receivePurchase(po, [{ productId: "p1", qty: 20, unitCost: 6_000 }]);

  const prod = useCatalogStore.getState().products[0];
  expect(prod.stock).toBe(25);
  expect(prod.costPrice).toBe(6_000);

  const entry = useStockLedgerStore.getState().entries[0];
  expect(entry.type).toBe("purchase_receipt");
  expect(entry.qty).toBe(20);
  expect(entry.refId).toBe("po1");
  expect(usePurchaseStore.getState().receipts).toHaveLength(1);
});
