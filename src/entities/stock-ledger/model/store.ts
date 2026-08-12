import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StockLedgerEntry } from "./types";

interface LedgerState {
  entries: StockLedgerEntry[];
  append: (entry: StockLedgerEntry) => void;
}

/** Append-only stock movement history, persisted per-device (offline). */
export const useStockLedgerStore = create<LedgerState>()(
  persist(
    (set) => ({
      entries: [],
      append: (entry) => set((s) => ({ entries: [entry, ...s.entries] })),
    }),
    { name: "pos-stock-ledger" },
  ),
);
