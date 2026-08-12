import type { LoyaltyConfig, MemberTier, PointEntry, Voucher } from "./types";

/** Current redeemable point balance (earned − redeemed). */
export function customerPoints(entries: PointEntry[], customerId: string): number {
  return entries.filter((e) => e.customerId === customerId).reduce((sum, e) => sum + e.delta, 0);
}

/** Lifetime points ever earned (positive deltas only) — drives tier. */
export function lifetimePoints(entries: PointEntry[], customerId: string): number {
  return entries
    .filter((e) => e.customerId === customerId && e.delta > 0)
    .reduce((sum, e) => sum + e.delta, 0);
}

/** Highest tier whose threshold the lifetime points reach. */
export function tierFor(lifetime: number, tiers: MemberTier[]): MemberTier | null {
  return (
    [...tiers]
      .sort((a, b) => b.minLifetimePoints - a.minLifetimePoints)
      .find((t) => lifetime >= t.minLifetimePoints) ?? null
  );
}

/** Points earned from a sale total. */
export function pointsForSale(total: number, config: LoyaltyConfig): number {
  return config.earnPer > 0 ? Math.floor(total / config.earnPer) : 0;
}

/** Rupiah value of redeeming a number of points. */
export function redeemToRupiah(points: number, config: LoyaltyConfig): number {
  return Math.max(0, points) * config.redeemValue;
}

/** Discount a voucher yields on a subtotal (0 if inactive/expired). */
export function voucherDiscount(voucher: Voucher, subtotal: number, now: Date = new Date()): number {
  if (!voucher.active) return 0;
  if (voucher.expiry && new Date(voucher.expiry).getTime() < now.getTime()) return 0;
  return voucher.type === "percent"
    ? Math.round((subtotal * voucher.value) / 100)
    : Math.min(voucher.value, subtotal);
}
