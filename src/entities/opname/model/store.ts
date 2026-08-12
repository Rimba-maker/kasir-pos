import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StockOpname } from "./types";

interface OpnameState {
  opnames: StockOpname[];
  add: (opname: StockOpname) => void;
}

/** Posted stock-take records, persisted per-device (offline). */
export const useOpnameStore = create<OpnameState>()(
  persist(
    (set) => ({
      opnames: [],
      add: (opname) => set((s) => ({ opnames: [opname, ...s.opnames] })),
    }),
    { name: "pos-opnames" },
  ),
);
