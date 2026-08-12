import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Customer, CustomerPayment } from "./types";

interface CustomerState {
  customers: Customer[];
  payments: CustomerPayment[];
  upsert: (customer: Customer) => void;
  remove: (id: string) => void;
  addPayment: (payment: CustomerPayment) => void;
}

/** Customer master, persisted to localStorage (offline, per-device). */
export const useCustomerStore = create<CustomerState>()(
  persist(
    (set) => ({
      customers: [],
      payments: [],
      upsert: (customer) =>
        set((s) => {
          const i = s.customers.findIndex((c) => c.id === customer.id);
          if (i === -1) return { customers: [...s.customers, customer] };
          const next = s.customers.slice();
          next[i] = customer;
          return { customers: next };
        }),
      remove: (id) => set((s) => ({ customers: s.customers.filter((c) => c.id !== id) })),
      addPayment: (payment) => set((s) => ({ payments: [payment, ...s.payments] })),
    }),
    { name: "pos-customers" },
  ),
);
