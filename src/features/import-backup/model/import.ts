import { useCatalogStore, type Product } from "@/entities/product";
import { useCustomerStore } from "@/entities/customer";
import { useStaffStore } from "@/entities/staff";
import { useSettingsStore } from "@/entities/store-settings";
import { useSalesStore } from "@/entities/transaction";
import { useStockLedgerStore } from "@/entities/stock-ledger";
import { useSupplierStore } from "@/entities/supplier";
import { usePurchaseStore } from "@/entities/purchase";
import { useOpnameStore } from "@/entities/opname";
import { useBatchStore } from "@/entities/batch";
import { useShiftStore } from "@/entities/shift";
import { usePromoStore } from "@/entities/promo";
import { useLoyaltyStore } from "@/entities/loyalty";
import type { BackupData } from "@/features/export-backup";

export type ParseResult = { ok: true; data: BackupData } | { ok: false; error: string };

/** Core collections required in every backup. */
const CORE = ["products", "categories", "customers", "staff", "transactions"] as const;
/** v2 array collections — optional; if present they must be arrays. */
const V2_ARRAYS = [
  "customerPayments", "stockLedger", "suppliers", "supplierPayments", "purchaseOrders",
  "goodsReceipts", "supplierReturns", "opnames", "batches", "shifts", "cashMovements",
  "promos", "memberTiers", "pointEntries", "vouchers",
] as const;

/** Migrate a legacy (v1) product to the current shape; idempotent. */
function upgradeProduct(raw: unknown): Product {
  const p = raw as Record<string, unknown>;
  if (p.prices && typeof p.prices === "object") return p as unknown as Product;
  return {
    ...p,
    costPrice: (p.costPrice as number | null) ?? null,
    prices: { umum: (p.price as number) ?? 0 },
    baseUnit: (p.baseUnit as string) ?? "pcs",
    units: (p.units as Product["units"]) ?? [],
  } as unknown as Product;
}

/** Validate + shape untrusted backup JSON. Trust boundary — never assume the shape. */
export function parseBackup(raw: unknown): ParseResult {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, error: "File backup tidak valid." };
  }
  const b = raw as Record<string, unknown>;
  if (b.version !== 1 && b.version !== 2) {
    return { ok: false, error: `Versi backup tidak didukung (butuh 1 atau 2).` };
  }
  for (const key of CORE) {
    if (!Array.isArray(b[key])) return { ok: false, error: `Data "${key}" hilang atau rusak.` };
  }
  if (typeof b.settings !== "object" || b.settings === null) {
    return { ok: false, error: `Pengaturan toko hilang atau rusak.` };
  }
  for (const key of V2_ARRAYS) {
    if (key in b && !Array.isArray(b[key])) return { ok: false, error: `Data "${key}" rusak.` };
  }

  const data = { ...(b as unknown as BackupData), version: 2 as const };
  data.products = (b.products as unknown[]).map(upgradeProduct);
  return { ok: true, data };
}

/**
 * Overwrite all local stores with a validated snapshot.
 * ponytail: writes to zustand stores only; Tauri/SQLite restore lands when
 * desktop-001 unblocks (needs the DB write path, untestable without Rust).
 */
export function restoreBackup(data: BackupData): void {
  useCatalogStore.setState({ products: data.products, categories: data.categories });
  useCustomerStore.setState({ customers: data.customers, payments: data.customerPayments ?? [] });
  useStaffStore.setState({ staff: data.staff });
  useSettingsStore.setState({ settings: data.settings });
  useSalesStore.setState({ transactions: data.transactions });
  useStockLedgerStore.setState({ entries: data.stockLedger ?? [] });
  useSupplierStore.setState({ suppliers: data.suppliers ?? [], payments: data.supplierPayments ?? [] });
  usePurchaseStore.setState({
    orders: data.purchaseOrders ?? [],
    receipts: data.goodsReceipts ?? [],
    returns: data.supplierReturns ?? [],
  });
  useOpnameStore.setState({ opnames: data.opnames ?? [] });
  useBatchStore.setState({ batches: data.batches ?? [] });
  useShiftStore.setState({ shifts: data.shifts ?? [], cashMovements: data.cashMovements ?? [] });
  usePromoStore.setState({ promos: data.promos ?? [] });
  useLoyaltyStore.setState({
    ...(data.loyaltyConfig ? { config: data.loyaltyConfig } : {}),
    tiers: data.memberTiers ?? useLoyaltyStore.getState().tiers,
    pointEntries: data.pointEntries ?? [],
    vouchers: data.vouchers ?? [],
  });
}
