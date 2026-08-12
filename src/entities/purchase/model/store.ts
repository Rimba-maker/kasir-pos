import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GoodsReceipt, PurchaseOrder, SupplierReturn } from "./types";

interface PurchaseState {
  orders: PurchaseOrder[];
  receipts: GoodsReceipt[];
  returns: SupplierReturn[];
  upsertOrder: (po: PurchaseOrder) => void;
  removeOrder: (id: string) => void;
  addReceipt: (receipt: GoodsReceipt) => void;
  addReturn: (ret: SupplierReturn) => void;
}

/** Purchase orders + goods receipts, persisted per-device (offline). */
export const usePurchaseStore = create<PurchaseState>()(
  persist(
    (set) => ({
      orders: [],
      receipts: [],
      returns: [],
      upsertOrder: (po) =>
        set((s) => {
          const i = s.orders.findIndex((o) => o.id === po.id);
          if (i === -1) return { orders: [po, ...s.orders] };
          const next = s.orders.slice();
          next[i] = po;
          return { orders: next };
        }),
      removeOrder: (id) =>
        set((s) => ({
          orders: s.orders.filter((o) => o.id !== id),
          receipts: s.receipts.filter((r) => r.poId !== id),
        })),
      addReceipt: (receipt) => set((s) => ({ receipts: [receipt, ...s.receipts] })),
      addReturn: (ret) => set((s) => ({ returns: [ret, ...s.returns] })),
    }),
    { name: "pos-purchases" },
  ),
);
