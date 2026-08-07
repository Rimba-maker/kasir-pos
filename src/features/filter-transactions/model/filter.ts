import type { Transaction, TransactionStatus } from "@/entities/transaction";

export interface TransactionFilter {
  /** Inclusive local date "YYYY-MM-DD", or "" for no bound. */
  from?: string;
  to?: string;
  cashierId?: string | null;
  status?: TransactionStatus | "all";
}

/** Local date (YYYY-MM-DD) of an ISO timestamp. */
function localDay(iso: string): string {
  const d = new Date(iso);
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Filter transactions by date range, cashier and status. */
export function filterTransactions(txs: Transaction[], f: TransactionFilter): Transaction[] {
  return txs.filter((t) => {
    const day = localDay(t.createdAt);
    if (f.from && day < f.from) return false;
    if (f.to && day > f.to) return false;
    if (f.cashierId != null && f.cashierId !== "" && t.cashierId !== f.cashierId) return false;
    if (f.status && f.status !== "all" && t.status !== f.status) return false;
    return true;
  });
}
