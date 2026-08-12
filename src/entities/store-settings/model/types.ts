export interface StoreSettings {
  name: string;
  address: string;
  phone: string;
  currencySymbol: string;
  /** When false, tax is not applied at the till. */
  taxEnabled: boolean;
  /** Tax rate 0..1 (e.g. 0.11 for PPN 11%). */
  taxRate: number;
  /** When true, product prices already include tax (extracted at checkout). */
  taxInclusive: boolean;
  /** When true, the till uses cashier shifts (open/close + cash reconciliation). */
  shiftEnabled: boolean;
  receiptFooter: string;
  /** Printer device/share path forwarded to the print command. */
  printerTarget: string;
  /** Local path to the merchant's static QRIS image. */
  qrisImagePath: string;
}
