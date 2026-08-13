import type { Product } from "./types";

/** Display label: "Kaos Polos — Merah / L" for a variant, else just the name. */
export function variantLabel(p: Pick<Product, "name" | "variantName">): string {
  const v = p.variantName?.trim();
  return v ? `${p.name} — ${v}` : p.name;
}

export type CatalogEntry =
  | { kind: "single"; product: Product }
  | { kind: "group"; group: string; members: Product[] };

/**
 * Collapse products sharing a non-empty `variantGroup` into one group entry,
 * placed at the first member's position; everything else stays a single tile.
 */
export function groupProducts(products: Product[]): CatalogEntry[] {
  const out: CatalogEntry[] = [];
  const groupAt = new Map<string, number>();
  for (const p of products) {
    const g = p.variantGroup?.trim();
    if (!g) {
      out.push({ kind: "single", product: p });
      continue;
    }
    const at = groupAt.get(g);
    if (at === undefined) {
      groupAt.set(g, out.length);
      out.push({ kind: "group", group: g, members: [p] });
    } else {
      (out[at] as Extract<CatalogEntry, { kind: "group" }>).members.push(p);
    }
  }
  return out;
}

/** True if `sku` (trimmed, case-insensitive) is already used by another product. */
export function skuInUse(products: Product[], sku: string, exceptId?: string): boolean {
  const s = sku.trim().toLowerCase();
  if (!s) return false;
  return products.some((p) => p.id !== exceptId && (p.sku ?? "").trim().toLowerCase() === s);
}
