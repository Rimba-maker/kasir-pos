export interface Shift {
  id: string;
  openedAt: string;
  openedBy: string | null;
  /** Starting cash float, integer Rupiah. */
  openingCash: number;
  closedAt: string | null;
  /** Physically counted cash at close, integer Rupiah. */
  closingCounted: number | null;
  /** Expected cash at close (opening + sales + in − out), for the variance. */
  closingExpected: number | null;
  status: "open" | "closed";
}

export interface CashMovement {
  id: string;
  shiftId: string;
  type: "in" | "out";
  amount: number;
  note: string | null;
  at: string;
}
