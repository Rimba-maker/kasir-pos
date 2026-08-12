/** A debt line owed to a supplier (produced by a received purchase order). */
export interface Payable {
  id: string;
  /** Integer Rupiah owed. */
  amount: number;
  /** ISO date the payment falls due. */
  dueDate: string;
}

export interface AgingBuckets {
  /** Not yet due. */
  current: number;
  d1_30: number;
  d31_60: number;
  d61_90: number;
  over90: number;
  total: number;
}

const DAY = 86_400_000;

/**
 * Apply `paid` across payables FIFO (oldest due date first), returning what
 * remains on each. This is how a supplier's payments settle its debts.
 */
export function applyFifoPayments(
  payables: Payable[],
  paid: number,
): { id: string; dueDate: string; remaining: number }[] {
  const sorted = [...payables].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  let left = Math.max(0, paid);
  return sorted.map((p) => {
    const applied = Math.min(left, p.amount);
    left -= applied;
    return { id: p.id, dueDate: p.dueDate, remaining: p.amount - applied };
  });
}

/** Outstanding debt bucketed by how far past its due date it is. */
export function agingBuckets(payables: Payable[], paid: number, asOf: Date): AgingBuckets {
  const b: AgingBuckets = { current: 0, d1_30: 0, d31_60: 0, d61_90: 0, over90: 0, total: 0 };
  for (const r of applyFifoPayments(payables, paid)) {
    if (r.remaining <= 0) continue;
    const overdue = Math.floor((asOf.getTime() - new Date(r.dueDate).getTime()) / DAY);
    if (overdue <= 0) b.current += r.remaining;
    else if (overdue <= 30) b.d1_30 += r.remaining;
    else if (overdue <= 60) b.d31_60 += r.remaining;
    else if (overdue <= 90) b.d61_90 += r.remaining;
    else b.over90 += r.remaining;
    b.total += r.remaining;
  }
  return b;
}
