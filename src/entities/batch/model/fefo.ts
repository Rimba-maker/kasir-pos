import type { Batch } from "./types";

export interface FefoAllocation {
  batchId: string;
  take: number;
}

/**
 * Allocate `qty` across a product's batches First-Expired-First-Out.
 * Returns per-batch takes and any shortfall that batches couldn't cover.
 */
export function pickFefo(batches: Batch[], qty: number): { allocations: FefoAllocation[]; short: number } {
  const sorted = [...batches]
    .filter((b) => b.qty > 0)
    .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));
  let need = Math.max(0, qty);
  const allocations: FefoAllocation[] = [];
  for (const b of sorted) {
    if (need <= 0) break;
    const take = Math.min(need, b.qty);
    allocations.push({ batchId: b.id, take });
    need -= take;
  }
  return { allocations, short: need };
}

/** Batches with stock left whose expiry date is before `asOf`. */
export function expiredBatches(batches: Batch[], asOf: Date): Batch[] {
  return batches.filter((b) => b.qty > 0 && new Date(b.expiryDate).getTime() < asOf.getTime());
}
