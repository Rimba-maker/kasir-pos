import { useEffect, useMemo, useState } from "react";
import { PlayCircle } from "lucide-react";
import {
  TransactionStatusBadge,
  salesSummary,
  topProducts,
  useSalesStore,
} from "@/entities/transaction";
import { filterTransactions, type TransactionFilter } from "@/features/filter-transactions";
import { resumeSale } from "@/features/hold-resume-sale";
import { transactionApi, isTauri } from "@/shared/api/pos";
import { formatRupiah } from "@/shared/lib/currency";

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}-${`${d.getDate()}`.padStart(2, "0")}`;
}

interface SalesHistoryPageProps {
  /** Switch to the till after resuming a held sale. */
  onResumed?: () => void;
}

export function SalesHistoryPage({ onResumed }: SalesHistoryPageProps) {
  const transactions = useSalesStore((s) => s.transactions);
  const setAll = useSalesStore((s) => s.setAll);
  const [filter, setFilter] = useState<TransactionFilter>({
    from: today(),
    to: today(),
    status: "all",
  });

  useEffect(() => {
    if (isTauri()) transactionApi.list().then(setAll).catch(() => {});
  }, [setAll]);

  const shown = useMemo(() => filterTransactions(transactions, filter), [transactions, filter]);
  const summary = salesSummary(shown);
  const top = topProducts(shown);

  const field =
    "rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm text-fg outline-none focus:border-primary";

  async function onResume(id: string) {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;
    await resumeSale(tx);
    onResumed?.();
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4 sm:p-5">
      <h1 className="text-xl font-bold text-fg">Riwayat &amp; Laporan</h1>

      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="block text-muted">Dari</span>
          <input
            type="date"
            value={filter.from}
            onChange={(e) => setFilter((f) => ({ ...f, from: e.target.value }))}
            className={field}
          />
        </label>
        <label className="text-sm">
          <span className="block text-muted">Sampai</span>
          <input
            type="date"
            value={filter.to}
            onChange={(e) => setFilter((f) => ({ ...f, to: e.target.value }))}
            className={field}
          />
        </label>
        <label className="text-sm">
          <span className="block text-muted">Status</span>
          <select
            value={filter.status}
            onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value as TransactionFilter["status"] }))}
            className={field}
          >
            <option value="all">Semua</option>
            <option value="paid">Lunas</option>
            <option value="held">Ditahan</option>
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Card title="Omzet" value={formatRupiah(summary.revenue)} accent />
        <Card title="Transaksi Lunas" value={`${summary.count}`} />
        <div className="rounded-xl border border-border bg-surface p-3.5">
          <p className="text-xs text-muted">Terlaris</p>
          {top.length === 0 ? (
            <p className="mt-1 text-sm text-muted">—</p>
          ) : (
            <ol className="mt-1 space-y-0.5 text-sm">
              {top.slice(0, 3).map((p) => (
                <li key={p.productId} className="flex justify-between">
                  <span className="truncate text-fg">{p.name}</span>
                  <span className="tabular-nums text-muted">{p.qty}x</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-border bg-surface">
        <table className="w-full min-w-[520px] text-sm">
          <thead className="sticky top-0 bg-surface-2 text-left text-muted">
            <tr>
              <th className="px-3 py-2.5 font-medium">Waktu</th>
              <th className="px-3 py-2.5 font-medium">Status</th>
              <th className="px-3 py-2.5 text-right font-medium">Item</th>
              <th className="px-3 py-2.5 text-right font-medium">Total</th>
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {shown.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-10 text-center text-muted">
                  Tidak ada transaksi pada filter ini.
                </td>
              </tr>
            ) : (
              shown.map((t) => (
                <tr key={t.id} className="transition-colors hover:bg-surface-2/60">
                  <td className="px-3 py-2.5 text-muted">{new Date(t.createdAt).toLocaleString("id-ID")}</td>
                  <td className="px-3 py-2.5">
                    <TransactionStatusBadge status={t.status} />
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-fg">
                    {t.items.reduce((n, i) => n + i.qty, 0)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-medium tabular-nums text-fg">
                    {formatRupiah(t.total)}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    {t.status === "held" && (
                      <button
                        type="button"
                        onClick={() => onResume(t.id)}
                        className="inline-flex cursor-pointer items-center gap-1 font-medium text-primary transition-colors hover:text-primary-hover"
                      >
                        <PlayCircle className="h-4 w-4" />
                        Lanjutkan
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Card({ title, value, accent }: { title: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3.5">
      <p className="text-xs text-muted">{title}</p>
      <p className={`mt-1 text-xl font-bold tabular-nums ${accent ? "text-primary" : "text-fg"}`}>
        {value}
      </p>
    </div>
  );
}
