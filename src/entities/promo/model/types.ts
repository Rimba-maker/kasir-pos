export type PromoType = "percent" | "nominal" | "qty_break" | "bundle" | "buy_x_get_y";

export interface Promo {
  id: string;
  name: string;
  active: boolean;
  type: PromoType;
  /** Target product (percent/nominal/qty_break/buy_x_get_y). */
  productId?: string | null;
  /** Products that must all be present (bundle). */
  productIds?: string[];
  /** Fraction 0..1 (percent). */
  percent?: number;
  /** Rupiah: nominal amount, per-unit discount (qty_break), or bundle saving. */
  amount?: number;
  /** Minimum qty to trigger (qty_break / buy_x_get_y). */
  minQty?: number;
  /** Free units granted per triggered set (buy_x_get_y). */
  freeQty?: number;
  startAt?: string | null;
  endAt?: string | null;
}
