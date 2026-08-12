import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GoodsReceipt, PurchaseOrder } from "./types";

interface PurchaseState {
  orders: PurchaseOrder[];
  receipts: GoodsReceipt[];
  upsertOrder: (po: PurchaseOrder) => void;
  removeOrder: (id: string) => void;
  addReceipt: (receipt: GoodsReceipt) => void;
}

/** Purchase orders + goods receipts, persisted per-device (offline). */
export const usePurchaseStore = create<PurchaseState>()(
  persist(
    (set) => ({
      orders: [],
      receipts: [],
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
    }),
    { name: "pos-purchases" },
  ),
);
