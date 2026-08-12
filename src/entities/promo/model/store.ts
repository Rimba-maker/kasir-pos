import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Promo } from "./types";

interface PromoState {
  promos: Promo[];
  upsert: (promo: Promo) => void;
  remove: (id: string) => void;
}

/** Promotions, persisted per-device (offline). */
export const usePromoStore = create<PromoState>()(
  persist(
    (set) => ({
      promos: [],
      upsert: (promo) =>
        set((s) => {
          const i = s.promos.findIndex((p) => p.id === promo.id);
          if (i === -1) return { promos: [...s.promos, promo] };
          const next = s.promos.slice();
          next[i] = promo;
          return { promos: next };
        }),
      remove: (id) => set((s) => ({ promos: s.promos.filter((p) => p.id !== id) })),
    }),
    { name: "pos-promos" },
  ),
);
