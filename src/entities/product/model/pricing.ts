import type { Product } from "./types";

/** The always-present default price tier id. */
export const DEFAULT_TIER = "umum";

export interface PriceTier {
  id: string;
  name: string;
}

/** Seed tiers; a store can add more (reseller, grup, ...). "umum" is mandatory. */
export const DEFAULT_PRICE_TIERS: PriceTier[] = [
  { id: "umum", name: "Umum" },
  { id: "grosir", name: "Grosir" },
];

/** Sell price for a tier, falling back to the "umum" tier, then 0. */
export function sellPrice(product: Pick<Product, "prices">, tierId: string = DEFAULT_TIER): number {
  return product.prices[tierId] ?? product.prices[DEFAULT_TIER] ?? 0;
}
