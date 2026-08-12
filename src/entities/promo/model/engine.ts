import type { Promo } from "./types";

export interface CartLineLite {
  productId: string;
  unitPrice: number;
  qty: number;
}

const lineFor = (lines: CartLineLite[], id?: string | null) => lines.find((l) => l.productId === id);
const subtotal = (lines: CartLineLite[]) => lines.reduce((s, l) => s + l.unitPrice * l.qty, 0);
const productSubtotal = (lines: CartLineLite[], id?: string | null) => {
  const l = lineFor(lines, id);
  return l ? l.unitPrice * l.qty : 0;
};

function withinWindow(p: Promo, now: Date): boolean {
  const t = now.getTime();
  if (p.startAt && new Date(p.startAt).getTime() > t) return false;
  if (p.endAt && new Date(p.endAt).getTime() < t) return false;
  return true;
}

/** Discount (Rupiah) a single promo yields for a cart. 0 if it doesn't apply. */
export function promoDiscount(promo: Promo, lines: CartLineLite[]): number {
  switch (promo.type) {
    case "percent": {
      const base = promo.productId ? productSubtotal(lines, promo.productId) : subtotal(lines);
      return Math.round(base * (promo.percent ?? 0));
    }
    case "nominal": {
      const base = promo.productId ? productSubtotal(lines, promo.productId) : subtotal(lines);
      return Math.min(promo.amount ?? 0, base);
    }
    case "qty_break": {
      const l = lineFor(lines, promo.productId);
      if (!l || l.qty < (promo.minQty ?? Infinity)) return 0;
      return (promo.amount ?? 0) * l.qty;
    }
    case "bundle": {
      const ids = promo.productIds ?? [];
      if (ids.length === 0) return 0;
      const times = Math.min(...ids.map((id) => lineFor(lines, id)?.qty ?? 0));
      return times >= 1 ? (promo.amount ?? 0) * Math.floor(times) : 0;
    }
    case "buy_x_get_y": {
      const l = lineFor(lines, promo.productId);
      const min = promo.minQty ?? 0;
      if (!l || min <= 0 || l.qty < min) return 0;
      const free = Math.floor(l.qty / min) * (promo.freeQty ?? 0);
      return free * l.unitPrice;
    }
  }
}

/** The single most valuable applicable promo (no stacking). */
export function applicablePromo(
  promos: Promo[],
  lines: CartLineLite[],
  now: Date = new Date(),
): { promo: Promo; discount: number } | null {
  let best: { promo: Promo; discount: number } | null = null;
  for (const p of promos) {
    if (!p.active || !withinWindow(p, now)) continue;
    const discount = promoDiscount(p, lines);
    if (discount > 0 && (!best || discount > best.discount)) best = { promo: p, discount };
  }
  return best;
}
