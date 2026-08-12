export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  address?: string | null;
  province?: string | null;
  city?: string | null;
  /** Default price tier applied at the till. */
  priceTierId?: string | null;
  /** Manual segment tags. */
  tags?: string[];
  note?: string | null;
}

export interface CustomerPayment {
  id: string;
  customerId: string;
  /** Transaction this settles, if any (FIFO otherwise). */
  txId: string | null;
  amount: number;
  at: string;
  method: string | null;
  note: string | null;
}
