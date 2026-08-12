export interface MemberTier {
  id: string;
  name: string;
  /** Lifetime earned points required to reach this tier. */
  minLifetimePoints: number;
}

export interface LoyaltyConfig {
  /** Rupiah spent to earn 1 point. */
  earnPer: number;
  /** Rupiah value of redeeming 1 point. */
  redeemValue: number;
}

export interface PointEntry {
  id: string;
  customerId: string;
  txId: string | null;
  /** Positive = earned, negative = redeemed. */
  delta: number;
  at: string;
  reason: string;
}

export interface Voucher {
  id: string;
  code: string;
  type: "percent" | "nominal";
  /** Percent number (e.g. 10) or Rupiah amount. */
  value: number;
  active: boolean;
  expiry: string | null;
  /** Bound to one customer, or null for anyone. */
  customerId: string | null;
}
