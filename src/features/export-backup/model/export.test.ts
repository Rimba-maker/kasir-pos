import { beforeEach, expect, test } from "vitest";
import { useCatalogStore } from "@/entities/product";
import { useCustomerStore } from "@/entities/customer";
import { buildBackup } from "./export";

beforeEach(() => {
  useCatalogStore.setState({ products: [], categories: [] });
  useCustomerStore.setState({ customers: [] });
});

test("backup includes all local data with a version stamp", async () => {
  useCatalogStore.getState().setProducts([
    { id: "p1", name: "Kopi", price: 10_000, categoryId: null, stock: 5, barcode: null, imagePath: null },
  ]);
  useCatalogStore.getState().setCategories([{ id: "c1", name: "Minuman" }]);
  useCustomerStore.getState().upsert({ id: "cu1", name: "Budi", phone: "0812" });

  const backup = await buildBackup();
  expect(backup.version).toBe(1);
  expect(backup.products).toHaveLength(1);
  expect(backup.categories[0].name).toBe("Minuman");
  expect(backup.customers[0].name).toBe("Budi");
  expect(backup.exportedAt).toMatch(/\d{4}-\d{2}-\d{2}T/);
});
