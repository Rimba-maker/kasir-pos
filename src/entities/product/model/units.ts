import { DEFAULT_TIER, sellPrice } from "./pricing";
import type { Product } from "./types";

/** Convert a quantity given in `unitName` to base units. Unknown unit = base (factor 1). */
export function toBaseQty(product: Pick<Product, "units">, unitName: string, qty: number): number {
  const u = product.units.find((x) => x.name === unitName);
  return qty * (u?.factor ?? 1);
}

/**
 * Sell price for one whole `unitName` at a tier: the unit's own override if set,
 * otherwise factor × the base sell price.
 */
export function unitSellPrice(
  product: Pick<Product, "prices" | "units">,
  unitName: string,
  tierId: string = DEFAULT_TIER,
): number {
  const u = product.units.find((x) => x.name === unitName);
  const override = u?.prices?.[tierId] ?? u?.prices?.[DEFAULT_TIER];
  if (override != null) return override;
  return sellPrice(product, tierId) * (u?.factor ?? 1);
}
