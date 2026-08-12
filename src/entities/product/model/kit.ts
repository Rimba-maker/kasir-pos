import type { Product } from "./types";

/**
 * Available quantity of a kit, derived from its components:
 * how many whole kits its scarcest component allows. No components → 0.
 */
export function kitStock(
  kit: Pick<Product, "components">,
  products: Pick<Product, "id" | "stock">[],
): number {
  const comps = kit.components;
  if (!comps || comps.length === 0) return 0;
  return Math.min(
    ...comps.map((c) => {
      const comp = products.find((p) => p.id === c.productId);
      return comp && c.qty > 0 ? Math.floor(comp.stock / c.qty) : 0;
    }),
  );
}
