import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LoyaltyConfig, MemberTier, PointEntry, Voucher } from "./types";

const DEFAULT_TIERS: MemberTier[] = [
  { id: "regular", name: "Regular", minLifetimePoints: 0 },
  { id: "silver", name: "Silver", minLifetimePoints: 100 },
  { id: "gold", name: "Gold", minLifetimePoints: 500 },
  { id: "platinum", name: "Platinum", minLifetimePoints: 2_000 },
];

interface LoyaltyState {
  config: LoyaltyConfig;
  tiers: MemberTier[];
  pointEntries: PointEntry[];
  vouchers: Voucher[];
  setConfig: (config: LoyaltyConfig) => void;
  upsertTier: (tier: MemberTier) => void;
  removeTier: (id: string) => void;
  addPointEntry: (entry: PointEntry) => void;
  upsertVoucher: (voucher: Voucher) => void;
  removeVoucher: (id: string) => void;
}

/** Loyalty config, tiers, point ledger, and vouchers — persisted offline. */
export const useLoyaltyStore = create<LoyaltyState>()(
  persist(
    (set) => ({
      config: { earnPer: 10_000, redeemValue: 100 },
      tiers: DEFAULT_TIERS,
      pointEntries: [],
      vouchers: [],
      setConfig: (config) => set({ config }),
      upsertTier: (tier) =>
        set((s) => {
          const i = s.tiers.findIndex((t) => t.id === tier.id);
          if (i === -1) return { tiers: [...s.tiers, tier] };
          const next = s.tiers.slice();
          next[i] = tier;
          return { tiers: next };
        }),
      removeTier: (id) => set((s) => ({ tiers: s.tiers.filter((t) => t.id !== id) })),
      addPointEntry: (entry) => set((s) => ({ pointEntries: [entry, ...s.pointEntries] })),
      upsertVoucher: (voucher) =>
        set((s) => {
          const i = s.vouchers.findIndex((v) => v.id === voucher.id);
          if (i === -1) return { vouchers: [...s.vouchers, voucher] };
          const next = s.vouchers.slice();
          next[i] = voucher;
          return { vouchers: next };
        }),
      removeVoucher: (id) => set((s) => ({ vouchers: s.vouchers.filter((v) => v.id !== id) })),
    }),
    { name: "pos-loyalty" },
  ),
);
