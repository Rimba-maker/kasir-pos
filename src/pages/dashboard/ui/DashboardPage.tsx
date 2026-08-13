import { useMemo, useState } from "react";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FileDown } from "lucide-react";
import { useSalesStore } from "@/entities/transaction";
import { paymentBreakdown, salesByDay, salesByHour, salesSummary, topProducts } from "@/features/dashboard";
import { exportSalesReportPdf } from "@/features/export";
import { formatRupiah } from "@/shared/lib/currency";
import { Button } from "@/shared/ui/Button";

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
const tooltipStyle = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  fontSize: 12,
} as const;

const METHOD_LABEL: Record<string, string> = { cash: "Tunai", qris: "QRIS", lainnya: "Lainnya" };
const PIE_COLORS = ["var(--color-primary)", "var(--color-accent)", "var(--color-muted)"];

export function DashboardPage() {
  const transactions = useSalesStore((s) => s.transactions);
  const [period, setPeriod] = useState<Period>("30d");

  const { summary, byDay, byHour, pay, top } = useMemo(() => {
    const cutoff = cutoffFor(period);
    const filtered = transactions.filter((t) => period === "all" || new Date(t.createdAt).getTime() >= cutoff);
    return {
      summary: salesSummary(filtered),
      byDay: salesByDay(filtered),
      byHour: salesByHour(filtered),
      pay: paymentBreakdown(filtered),
      top: topProducts(filtered),
    };
  }, [transactions, period]);

  const aov = summary.count ? Math.round(summary.omzet / summary.count) : 0;

  return (
    <div className="h-full overflow-auto p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-fg">Dashboard</h1>
        <div className="flex items-center gap-2">
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportSalesReportPdf(summary, top, PERIODS.find((p) => p.key === period)!.label)}
          >
            <FileDown className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Kpi label="Omzet" value={formatRupiah(summary.omzet)} />
        <Kpi label="Laba kotor" value={formatRupiah(summary.grossProfit)} accent />
        <Kpi label="HPP" value={formatRupiah(summary.hpp)} />
        <Kpi label="Transaksi" value={String(summary.count)} />
        <Kpi label="Rata2/transaksi" value={formatRupiah(aov)} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Tren omzet & laba">
          {byDay.length === 0 ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={byDay} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tick={tick} tickFormatter={(d: string) => d.slice(5)} />
                <YAxis tick={tick} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
                <Tooltip
                  formatter={(v, n) => [formatRupiah(Number(v) || 0), n === "profit" ? "Laba" : "Omzet"]}
                  contentStyle={tooltipStyle}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="var(--color-primary)"
                  fill="var(--color-primary)"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Line type="monotone" dataKey="profit" stroke="var(--color-accent)" strokeWidth={2} dot={false} />
              </ComposedChart>
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
                <Tooltip formatter={(v) => `${Number(v) || 0} terjual`} contentStyle={tooltipStyle} />
                <Bar dataKey="qty" fill="var(--color-accent)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Metode pembayaran">
          {pay.length === 0 ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pay} dataKey="total" nameKey="method" innerRadius={52} outerRadius={82} paddingAngle={2}>
                  {pay.map((entry, i) => (
                    <Cell key={entry.method} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v, n) => [formatRupiah(Number(v) || 0), METHOD_LABEL[String(n)] ?? String(n)]}
                  contentStyle={tooltipStyle}
                />
                <Legend formatter={(val) => METHOD_LABEL[String(val)] ?? String(val)} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Jam ramai">
          {byHour.length === 0 ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={byHour} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="label" tick={tick} />
                <YAxis tick={tick} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(v) => formatRupiah(Number(v) || 0)} contentStyle={tooltipStyle} />
                <Bar dataKey="total" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
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
