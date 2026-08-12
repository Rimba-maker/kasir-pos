export interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  note: string | null;
}

export interface SupplierPayment {
  id: string;
  supplierId: string;
  /** Purchase order this payment settles, if any (FIFO otherwise). */
  poId: string | null;
  /** Integer Rupiah. */
  amount: number;
  /** ISO timestamp. */
  at: string;
  method: string | null;
  note: string | null;
}
