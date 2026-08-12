import { beforeEach, expect, test } from "vitest";
import { useCatalogStore } from "@/entities/product";
import { useCustomerStore } from "@/entities/customer";
import { useStaffStore } from "@/entities/staff";
import { useSalesStore } from "@/entities/transaction";
import type { BackupData } from "@/features/export-backup";
import { parseBackup, restoreBackup } from "./import";

const validSnapshot: BackupData = {
  version: 1,
  exportedAt: "2026-08-12T00:00:00.000Z",
  products: [
    { id: "p1", name: "Kopi", costPrice: null, prices: { umum: 10_000 }, categoryId: null, stock: 5, barcode: null, imagePath: null },
  ],
  categories: [{ id: "c1", name: "Minuman" }],
  customers: [{ id: "cu1", name: "Budi", phone: "0812" }],
  staff: [],
  settings: {
    name: "Toko Baru",
    address: "",
    phone: "",
    currencySymbol: "Rp",
    taxEnabled: false,
    taxRate: 0,
    taxInclusive: false,
    receiptFooter: "",
    printerTarget: "",
    qrisImagePath: "",
  },
  transactions: [],
};

test("accepts a valid backup snapshot", () => {
  const result = parseBackup(validSnapshot);
  expect(result.ok).toBe(true);
  if (result.ok) {
    expect(result.data.products).toHaveLength(1);
    expect(result.data.categories[0].name).toBe("Minuman");
  }
});

test("rejects input that is not an object", () => {
  expect(parseBackup(null).ok).toBe(false);
  expect(parseBackup("nope").ok).toBe(false);
  expect(parseBackup(42).ok).toBe(false);
});

test("rejects an unsupported version", () => {
  const result = parseBackup({ ...validSnapshot, version: 2 });
  expect(result.ok).toBe(false);
});

test("rejects when a required collection is missing or not an array", () => {
  const { products: _omit, ...noProducts } = validSnapshot;
  expect(parseBackup(noProducts).ok).toBe(false);
  expect(parseBackup({ ...validSnapshot, transactions: "x" }).ok).toBe(false);
});

beforeEach(() => {
  useCatalogStore.setState({ products: [], categories: [] });
  useCustomerStore.setState({ customers: [] });
  useStaffStore.setState({ staff: [] });
  useSalesStore.setState({ transactions: [] });
});

test("restore replaces all local data with the snapshot", () => {
  // pre-existing data that must be overwritten, not merged
  useCatalogStore.getState().setProducts([
    { id: "old", name: "Teh", costPrice: null, prices: { umum: 5_000 }, categoryId: null, stock: 1, barcode: null, imagePath: null },
  ]);
  useCustomerStore.getState().upsert({ id: "old", name: "Lama", phone: "" });

  restoreBackup(validSnapshot);

  const catalog = useCatalogStore.getState();
  expect(catalog.products).toHaveLength(1);
  expect(catalog.products[0].id).toBe("p1");
  expect(catalog.categories[0].name).toBe("Minuman");
  expect(useCustomerStore.getState().customers).toEqual([{ id: "cu1", name: "Budi", phone: "0812" }]);
});
