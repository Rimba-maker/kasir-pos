import { expect, test } from "vitest";
import {
  customerPoints,
  lifetimePoints,
  pointsForSale,
  redeemToRupiah,
  tierFor,
  voucherDiscount,
} from "./loyalty";
import type { MemberTier, PointEntry, Voucher } from "./types";

const config = { earnPer: 10_000, redeemValue: 100 };
const entries: PointEntry[] = [
  { id: "1", customerId: "c1", txId: null, delta: 50, at: "", reason: "earn" },
  { id: "2", customerId: "c1", txId: null, delta: -20, at: "", reason: "redeem" },
  { id: "3", customerId: "c1", txId: null, delta: 30, at: "", reason: "earn" },
];

test("points balance nets earn and redeem; lifetime counts only earned", () => {
  expect(customerPoints(entries, "c1")).toBe(60);
  expect(lifetimePoints(entries, "c1")).toBe(80);
});

const tiers: MemberTier[] = [
  { id: "regular", name: "Regular", minLifetimePoints: 0 },
  { id: "silver", name: "Silver", minLifetimePoints: 50 },
  { id: "gold", name: "Gold", minLifetimePoints: 200 },
];

test("tierFor picks the highest reached tier", () => {
  expect(tierFor(80, tiers)?.id).toBe("silver");
  expect(tierFor(10, tiers)?.id).toBe("regular");
  expect(tierFor(500, tiers)?.id).toBe("gold");
});

test("pointsForSale and redeemToRupiah", () => {
  expect(pointsForSale(125_000, config)).toBe(12);
  expect(redeemToRupiah(12, config)).toBe(1_200);
});

test("voucherDiscount honors type, activity and expiry", () => {
  const v = (over: Partial<Voucher>): Voucher => ({ id: "v", code: "X", type: "percent", value: 10, active: true, expiry: null, customerId: null, ...over });
  expect(voucherDiscount(v({ type: "percent", value: 10 }), 100_000)).toBe(10_000);
  expect(voucherDiscount(v({ type: "nominal", value: 15_000 }), 100_000)).toBe(15_000);
  expect(voucherDiscount(v({ active: false }), 100_000)).toBe(0);
  expect(voucherDiscount(v({ expiry: "2020-01-01" }), 100_000, new Date("2026-01-01"))).toBe(0);
});
