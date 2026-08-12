import { useCatalogStore, type Category, type Product } from "@/entities/product";
import { useCustomerStore, type Customer, type CustomerPayment } from "@/entities/customer";
import { useStaffStore, type Staff } from "@/entities/staff";
import { useSettingsStore, type StoreSettings } from "@/entities/store-settings";
import { useSalesStore, type Transaction } from "@/entities/transaction";
import { useStockLedgerStore, type StockLedgerEntry } from "@/entities/stock-ledger";
import { useSupplierStore, type Supplier, type SupplierPayment } from "@/entities/supplier";
import {
  usePurchaseStore,
  type GoodsReceipt,
  type PurchaseOrder,
  type SupplierReturn,
} from "@/entities/purchase";
import { useOpnameStore, type StockOpname } from "@/entities/opname";
import { useBatchStore, type Batch } from "@/entities/batch";
import { useShiftStore, type CashMovement, type Shift } from "@/entities/shift";
import { usePromoStore, type Promo } from "@/entities/promo";
import {
  useLoyaltyStore,
  type LoyaltyConfig,
  type MemberTier,
  type PointEntry,
  type Voucher,
} from "@/entities/loyalty";
import { transactionApi, isTauri } from "@/shared/api/pos";

export interface BackupData {
  /** 1 = legacy, 2 = current (all modules). */
  version: 1 | 2;
  exportedAt: string;
  products: Product[];
  categories: Category[];
  customers: Customer[];
  staff: Staff[];
  settings: StoreSettings;
  transactions: Transaction[];
  // v2 collections (optional so v1 files still type-check):
  customerPayments?: CustomerPayment[];
  stockLedger?: StockLedgerEntry[];
  suppliers?: Supplier[];
  supplierPayments?: SupplierPayment[];
  purchaseOrders?: PurchaseOrder[];
  goodsReceipts?: GoodsReceipt[];
  supplierReturns?: SupplierReturn[];
  opnames?: StockOpname[];
  batches?: Batch[];
  shifts?: Shift[];
  cashMovements?: CashMovement[];
  promos?: Promo[];
  loyaltyConfig?: LoyaltyConfig;
  memberTiers?: MemberTier[];
  pointEntries?: PointEntry[];
  vouchers?: Voucher[];
}

/** Assemble a full v2 snapshot of all local data. */
export async function buildBackup(): Promise<BackupData> {
  const catalog = useCatalogStore.getState();
  const customer = useCustomerStore.getState();
  const supplier = useSupplierStore.getState();
  const purchase = usePurchaseStore.getState();
  const shift = useShiftStore.getState();
  const loyalty = useLoyaltyStore.getState();
  const transactions = isTauri()
    ? await transactionApi.list().catch(() => [])
    : useSalesStore.getState().transactions;

  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    products: catalog.products,
    categories: catalog.categories,
    customers: customer.customers,
    customerPayments: customer.payments,
    staff: useStaffStore.getState().staff,
    settings: useSettingsStore.getState().settings,
    transactions,
    stockLedger: useStockLedgerStore.getState().entries,
    suppliers: supplier.suppliers,
    supplierPayments: supplier.payments,
    purchaseOrders: purchase.orders,
    goodsReceipts: purchase.receipts,
    supplierReturns: purchase.returns,
    opnames: useOpnameStore.getState().opnames,
    batches: useBatchStore.getState().batches,
    shifts: shift.shifts,
    cashMovements: shift.cashMovements,
    promos: usePromoStore.getState().promos,
    loyaltyConfig: loyalty.config,
    memberTiers: loyalty.tiers,
    pointEntries: loyalty.pointEntries,
    vouchers: loyalty.vouchers,
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
