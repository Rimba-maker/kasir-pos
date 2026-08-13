// App-wide constants. No business logic here.

export const CURRENCY_SYMBOL = "Rp";

/** Default PPN rate (11%) used when tax is enabled in settings. */
export const DEFAULT_TAX_RATE = 0.11;

/**
 * Indonesian cash denominations (Rupiah), descending — notes 100rb…1rb + coins.
 * Tapped additively on the cash pad, so every real note/coin is available.
 */
export const IDR_DENOMINATIONS = [
  100_000, 50_000, 20_000, 10_000, 5_000, 2_000, 1_000, 500, 200, 100,
] as const;
