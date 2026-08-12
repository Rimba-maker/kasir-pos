import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useSalesStore } from "@/entities/transaction";
import { salesByDay, salesSummary, topProducts } from "@/features/dashboard";
import { formatRupiah } from "@/shared/lib/currency";

type Period = "today" | "7d" | "30d" | "all";
const PERIODS: { key: Period; label: string }[] = [
  { key: "today", label: "Hari ini" },
  { key: "7d", label: "7 hari" },
  { key: "30d", label: "30 hari" },
  { key: "all", label: "Semua" },
];

function cutoffFor(period: Period): number {
  const d = new Date();
  if (period === "today") {
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }
  if (period === "7d") return Date.now() - 7 * 864e5;
  if (period === "30d") return Date.now() - 30 * 864e5;
  return 0;
}

const tick = { fill: "var(--color-muted)", fontSize: 11 };

export function DashboardPage() {
  const transactions = useSalesStore((s) => s.transactions);
  const [period, setPeriod] = useState<Period>("30d");

  const { summary, byDay, top } = useMemo(() => {
    const cutoff = cutoffFor(period);
    const filtered = transactions.filter((t) => period === "all" || new Date(t.createdAt).getTime() >= cutoff);
    return { summary: salesSummary(filtered), byDay: salesByDay(filtered), top: topProducts(filtered) };
  }, [transactions, period]);

  return (
    <div className="h-full overflow-auto p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-fg">Dashboard</h1>
        <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPeriod(p.key)}
              className={`cursor-pointer rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                period === p.key ? "bg-primary text-on-primary" : "text-muted hover:text-fg"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Omzet" value={formatRupiah(summary.omzet)} />
        <Kpi label="Laba kotor" value={formatRupiah(summary.grossProfit)} accent />
        <Kpi label="HPP" value={formatRupiah(summary.hpp)} />
        <Kpi label="Transaksi" value={String(summary.count)} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Tren penjualan">
          {byDay.length === 0 ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={byDay} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tick={tick} tickFormatter={(d: string) => d.slice(5)} />
                <YAxis tick={tick} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
                <Tooltip
                  formatter={(v) => formatRupiah(Number(v) || 0)}
                  contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
                />
                <Line type="monotone" dataKey="total" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Produk terlaris">
          {top.length === 0 ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={top} layout="vertical" margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <XAxis type="number" tick={tick} hide />
                <YAxis type="category" dataKey="name" tick={tick} width={90} />
                <Tooltip
                  formatter={(v) => `${Number(v) || 0} terjual`}
                  contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="qty" fill="var(--color-accent)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-1 text-lg font-bold ${accent ? "text-primary" : "text-fg"}`}>{value}</p>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h2 className="mb-3 text-sm font-semibold text-fg">{title}</h2>
      {children}
    </div>
  );
}

function Empty() {
  return <div className="flex h-[240px] items-center justify-center text-sm text-muted">Belum ada data.</div>;
}
