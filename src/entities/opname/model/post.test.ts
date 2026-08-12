import { beforeEach, expect, test } from "vitest";
import { useCatalogStore } from "@/entities/product";
import { useStockLedgerStore } from "@/entities/stock-ledger";
import { useOpnameStore } from "./store";
import { postOpname } from "./post";

const stockOf = (id: string) => useCatalogStore.getState().products.find((p) => p.id === id)!.stock;

beforeEach(() => {
  useStockLedgerStore.setState({ entries: [] });
  useOpnameStore.setState({ opnames: [] });
  useCatalogStore.setState({
    products: [
      { id: "p1", name: "Kopi", costPrice: 6_000, prices: { umum: 10_000 }, baseUnit: "pcs", units: [], categoryId: null, stock: 5, barcode: null, imagePath: null },
    ],
    categories: [],
  });
});

test("counting more than the system adjusts stock up via the ledger", () => {
  postOpname([{ productId: "p1", countedQty: 8 }]);
  expect(stockOf("p1")).toBe(8);
  const entry = useStockLedgerStore.getState().entries[0];
  expect(entry.type).toBe("opname_adjust");
  expect(entry.qty).toBe(3);
  expect(useOpnameStore.getState().opnames).toHaveLength(1);
});

test("counting less adjusts stock down", () => {
  postOpname([{ productId: "p1", countedQty: 2 }]);
  expect(stockOf("p1")).toBe(2);
  expect(useStockLedgerStore.getState().entries[0].qty).toBe(-3);
});

test("no difference records the opname but no ledger movement", () => {
  postOpname([{ productId: "p1", countedQty: 5 }]);
  expect(stockOf("p1")).toBe(5);
  expect(useStockLedgerStore.getState().entries).toHaveLength(0);
  expect(useOpnameStore.getState().opnames).toHaveLength(1);
});
