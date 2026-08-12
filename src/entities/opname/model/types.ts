export interface OpnameLine {
  productId: string;
  /** Physical counted quantity, base units. */
  countedQty: number;
}

export interface StockOpname {
  id: string;
  at: string;
  byStaffId: string | null;
  note: string | null;
  lines: OpnameLine[];
}
