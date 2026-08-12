import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Supplier, SupplierPayment } from "./types";

interface SupplierState {
  suppliers: Supplier[];
  payments: SupplierPayment[];
  upsert: (supplier: Supplier) => void;
  remove: (id: string) => void;
  addPayment: (payment: SupplierPayment) => void;
  removePayment: (id: string) => void;
}

/** Supplier master + payment history, persisted per-device (offline). */
export const useSupplierStore = create<SupplierState>()(
  persist(
    (set) => ({
      suppliers: [],
      payments: [],
      upsert: (supplier) =>
        set((s) => {
          const i = s.suppliers.findIndex((x) => x.id === supplier.id);
          if (i === -1) return { suppliers: [...s.suppliers, supplier] };
          const next = s.suppliers.slice();
          next[i] = supplier;
          return { suppliers: next };
        }),
      remove: (id) => set((s) => ({ suppliers: s.suppliers.filter((x) => x.id !== id) })),
      addPayment: (payment) => set((s) => ({ payments: [payment, ...s.payments] })),
      removePayment: (id) => set((s) => ({ payments: s.payments.filter((p) => p.id !== id) })),
    }),
    { name: "pos-suppliers" },
  ),
);

/** Total paid to a supplier so far. */
export function supplierPaid(payments: SupplierPayment[], supplierId: string): number {
  return payments.filter((p) => p.supplierId === supplierId).reduce((sum, p) => sum + p.amount, 0);
}
