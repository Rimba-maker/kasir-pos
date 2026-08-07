import { useCatalogStore, type Category, type Product } from "@/entities/product";
import { useCustomerStore, type Customer } from "@/entities/customer";
import { useStaffStore, type Staff } from "@/entities/staff";
import { useSettingsStore, type StoreSettings } from "@/entities/store-settings";
import { useSalesStore, type Transaction } from "@/entities/transaction";
import { transactionApi, isTauri } from "@/shared/api/pos";

export interface BackupData {
  version: 1;
  exportedAt: string;
  products: Product[];
  categories: Category[];
  customers: Customer[];
  staff: Staff[];
  settings: StoreSettings;
  transactions: Transaction[];
}

/** Assemble a full snapshot of all local data. */
export async function buildBackup(): Promise<BackupData> {
  const catalog = useCatalogStore.getState();
  const transactions = isTauri()
    ? await transactionApi.list().catch(() => [])
    : useSalesStore.getState().transactions;

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    products: catalog.products,
    categories: catalog.categories,
    customers: useCustomerStore.getState().customers,
    staff: useStaffStore.getState().staff,
    settings: useSettingsStore.getState().settings,
    transactions,
  };
}

/** Download the backup as a JSON file. */
export async function downloadBackup(): Promise<void> {
  const data = await buildBackup();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `kasir-pos-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
