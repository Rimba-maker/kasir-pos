import { create } from "zustand";
import { persist } from "zustand/middleware";
import { pickFefo } from "./fefo";
import type { Batch } from "./types";

interface BatchState {
  batches: Batch[];
  add: (batch: Batch) => void;
  remove: (id: string) => void;
}

/** Per-product batches with expiry, persisted per-device (offline). */
export const useBatchStore = create<BatchState>()(
  persist(
    (set) => ({
      batches: [],
      add: (batch) => set((s) => ({ batches: [batch, ...s.batches] })),
      remove: (id) => set((s) => ({ batches: s.batches.filter((b) => b.id !== id) })),
    }),
    { name: "pos-batches" },
  ),
);

/**
 * Consume `qty` of a product FEFO, decrementing batch quantities.
 * Returns the shortfall (qty that no batch could cover).
 */
export function consumeBatchesFefo(productId: string, qty: number): number {
  const batches = useBatchStore.getState().batches.filter((b) => b.productId === productId);
  const { allocations, short } = pickFefo(batches, qty);
  const take = new Map(allocations.map((a) => [a.batchId, a.take]));
  useBatchStore.setState((s) => ({
    batches: s.batches.map((b) => (take.has(b.id) ? { ...b, qty: b.qty - take.get(b.id)! } : b)),
  }));
  return short;
}
