import { useEffect, useMemo, useState } from "react";
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

  const field = "rounded-md border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-neutral-500";

  async function onResume(id: string) {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;
    await resumeSale(tx);
    onResumed?.();
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <h1 className="text-lg font-bold">Riwayat &amp; Laporan</h1>

      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="block text-neutral-600">Dari</span>
          <input
            type="date"
            value={filter.from}
            onChange={(e) => setFilter((f) => ({ ...f, from: e.target.value }))}
            className={field}
          />
        </label>
        <label className="text-sm">
          <span className="block text-neutral-600">Sampai</span>
          <input
            type="date"
            value={filter.to}
            onChange={(e) => setFilter((f) => ({ ...f, to: e.target.value }))}
            className={field}
          />
        </label>
        <label className="text-sm">
          <span className="block text-neutral-600">Status</span>
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
        <Card title="Omzet" value={formatRupiah(summary.revenue)} />
        <Card title="Transaksi Lunas" value={`${summary.count}`} />
        <div className="rounded-lg border border-neutral-200 bg-white p-3">
          <p className="text-xs text-neutral-500">Terlaris</p>
          {top.length === 0 ? (
            <p className="mt-1 text-sm text-neutral-400">—</p>
          ) : (
            <ol className="mt-1 space-y-0.5 text-sm">
              {top.slice(0, 3).map((p) => (
                <li key={p.productId} className="flex justify-between">
                  <span className="truncate">{p.name}</span>
                  <span className="tabular-nums text-neutral-500">{p.qty}x</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-neutral-50 text-left text-neutral-500">
            <tr>
              <th className="px-3 py-2">Waktu</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2 text-right">Item</th>
              <th className="px-3 py-2 text-right">Total</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {shown.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-neutral-400">
                  Tidak ada transaksi pada filter ini.
                </td>
              </tr>
            ) : (
              shown.map((t) => (
                <tr key={t.id} className="hover:bg-neutral-50">
                  <td className="px-3 py-2 text-neutral-600">
                    {new Date(t.createdAt).toLocaleString("id-ID")}
                  </td>
                  <td className="px-3 py-2">
                    <TransactionStatusBadge status={t.status} />
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {t.items.reduce((n, i) => n + i.qty, 0)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatRupiah(t.total)}</td>
                  <td className="px-3 py-2 text-right">
                    {t.status === "held" && (
                      <button
                        type="button"
                        onClick={() => onResume(t.id)}
                        className="text-emerald-600 hover:text-emerald-700"
                      >
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

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-3">
      <p className="text-xs text-neutral-500">{title}</p>
      <p className="mt-1 text-xl font-bold tabular-nums">{value}</p>
    </div>
  );
}
