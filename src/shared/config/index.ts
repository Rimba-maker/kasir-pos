// App-wide constants. No business logic here.

export const CURRENCY_SYMBOL = "Rp";

/** Rupiah has no sub-unit — all money is stored as whole integers. */
export const MONEY_DECIMALS = 0;

/** Default PPN rate (11%) used when tax is enabled in settings. */
export const DEFAULT_TAX_RATE = 0.11;

/** Cash payment-pad shortcut nominals (Rupiah). */
export const CASH_SHORTCUTS = [10_000, 20_000, 50_000, 100_000] as const;
