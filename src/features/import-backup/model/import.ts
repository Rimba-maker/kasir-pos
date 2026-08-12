import { useCatalogStore } from "@/entities/product";
import { useCustomerStore } from "@/entities/customer";
import { useStaffStore } from "@/entities/staff";
import { useSettingsStore } from "@/entities/store-settings";
import { useSalesStore } from "@/entities/transaction";
import type { BackupData } from "@/features/export-backup";

export type ParseResult =
  | { ok: true; data: BackupData }
  | { ok: false; error: string };

const COLLECTIONS = ["products", "categories", "customers", "staff", "transactions"] as const;

/** Validate + shape untrusted backup JSON. Trust boundary — never assume the shape. */
export function parseBackup(raw: unknown): ParseResult {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, error: "File backup tidak valid." };
  }
  const b = raw as Record<string, unknown>;
  if (b.version !== 1) {
    return { ok: false, error: `Versi backup tidak didukung (butuh 1).` };
  }
  for (const key of COLLECTIONS) {
    if (!Array.isArray(b[key])) {
      return { ok: false, error: `Data "${key}" hilang atau rusak.` };
    }
  }
  if (typeof b.settings !== "object" || b.settings === null) {
    return { ok: false, error: `Pengaturan toko hilang atau rusak.` };
  }
  return { ok: true, data: raw as BackupData };
}

/**
 * Overwrite all local stores with a validated snapshot.
 * ponytail: writes to zustand stores only; Tauri/SQLite restore lands when
 * desktop-001 unblocks (needs the DB write path, untestable without Rust).
 */
export function restoreBackup(data: BackupData): void {
  useCatalogStore.setState({ products: data.products, categories: data.categories });
  useCustomerStore.setState({ customers: data.customers });
  useStaffStore.setState({ staff: data.staff });
  useSettingsStore.setState({ settings: data.settings });
  useSalesStore.setState({ transactions: data.transactions });
}
