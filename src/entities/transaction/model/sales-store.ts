import { create } from "zustand";
import type { Transaction } from "./types";

interface SalesState {
  transactions: Transaction[];
  setAll: (transactions: Transaction[]) => void;
  add: (tx: Transaction) => void;
  remove: (id: string) => void;
}

/**
 * Recent transactions for history/reporting. In Tauri this is hydrated from the
 * DB; finalize() also pushes here so the browser demo shows sales immediately.
 */
export const useSalesStore = create<SalesState>((set) => ({
  transactions: [],
  setAll: (transactions) => set({ transactions }),
  add: (tx) => set((s) => ({ transactions: [tx, ...s.transactions] })),
  remove: (id) => set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),
}));
