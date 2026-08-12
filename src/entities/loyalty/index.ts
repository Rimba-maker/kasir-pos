export type { MemberTier, LoyaltyConfig, PointEntry, Voucher } from "./model/types";
export { useLoyaltyStore } from "./model/store";
export {
  customerPoints,
  lifetimePoints,
  tierFor,
  pointsForSale,
  redeemToRupiah,
  voucherDiscount,
} from "./model/loyalty";
