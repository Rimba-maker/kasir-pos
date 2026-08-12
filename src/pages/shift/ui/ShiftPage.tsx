import { useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, PlayCircle, StopCircle } from "lucide-react";
import { currentShift, reconcileShift, useShiftStore } from "@/entities/shift";
import { useSalesStore } from "@/entities/transaction";
import { formatRupiah } from "@/shared/lib/currency";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";

export function ShiftPage() {
  const shifts = useShiftStore((s) => s.shifts);
  const cashMovements = useShiftStore((s) => s.cashMovements);
  const open = useShiftStore((s) => s.open);
  const addCash = useShiftStore((s) => s.addCash);
  const close = useShiftStore((s) => s.close);
  const transactions = useSalesStore((s) => s.transactions);

  const shift = currentShift(shifts);
  const [openingCash, setOpeningCash] = useState(0);
  const [cashModal, setCashModal] = useState<"in" | "out" | null>(null);
  const [closing, setClosing] = useState(false);

  const moves = shift ? cashMovements.filter((m) => m.shiftId === shift.id) : [];
  const cashIn = moves.filter((m) => m.type === "in").reduce((s, m) => s + m.amount, 0);
  const cashOut = moves.filter((m) => m.type === "out").reduce((s, m) => s + m.amount, 0);
  const cashSales = shift
    ? transactions
        .filter((t) => t.shiftId === shift.id && t.payment?.method === "cash")
        .reduce((s, t) => s + t.total, 0)
    : 0;
  const expected = shift ? shift.openingCash + cashSales + cashIn - cashOut : 0;

  const closedShifts = shifts.filter((s) => s.status === "closed");

  return (
    <div className="h-full overflow-auto p-4 sm:p-5">
      <h1 className="mb-4 text-xl font-bold text-fg">Shift Kasir</h1>

      {!shift ? (
        <div className="max-w-sm space-y-3 rounded-xl border border-border bg-surface p-4">
          <p className="text-sm text-muted">Tidak ada shift terbuka. Mulai shift dengan modal kas awal.</p>
          <label className="block text-sm">
            <span className="text-muted">Modal kas awal</span>
            <input
              type="number"
              min={0}
              value={openingCash || ""}
              onChange={(e) => setOpeningCash(Number(e.target.value) || 0)}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg outline-none focus:border-primary"
            />
          </label>
          <Button variant="primary" onClick={() => open(openingCash)} className="w-full">
            <PlayCircle className="h-4 w-4" />
            Buka shift
          </Button>
        </div>
      ) : (
        <div className="max-w-md space-y-4">
          <div className="space-y-2 rounded-xl border border-border bg-surface p-4">
            <Row label="Dibuka" value={new Date(shift.openedAt).toLocaleString("id-ID")} />
            <Row label="Modal awal" value={formatRupiah(shift.openingCash)} />
            <Row label="Penjualan tunai" value={formatRupiah(cashSales)} />
            <Row label="Kas masuk" value={formatRupiah(cashIn)} />
            <Row label="Kas keluar" value={`− ${formatRupiah(cashOut)}`} />
            <div className="border-t border-border pt-2">
              <Row label="Kas seharusnya" value={formatRupiah(expected)} strong />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setCashModal("in")}>
              <ArrowDownCircle className="h-4 w-4" />
              Kas masuk
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCashModal("out")}>
              <ArrowUpCircle className="h-4 w-4" />
              Kas keluar
            </Button>
            <Button variant="danger" size="sm" onClick={() => setClosing(true)}>
              <StopCircle className="h-4 w-4" />
              Tutup shift
            </Button>
          </div>
        </div>
      )}

      {closedShifts.length > 0 && (
        <div className="mt-6 max-w-md">
          <h2 className="mb-2 text-sm font-semibold text-muted">Riwayat shift</h2>
          <div className="space-y-2">
            {closedShifts.slice(0, 10).map((s) => {
              const variance = (s.closingCounted ?? 0) - (s.closingExpected ?? 0);
              return (
                <div key={s.id} className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-sm">
                  <span className="text-muted">{new Date(s.openedAt).toLocaleDateString("id-ID")}</span>
                  <span className="text-fg">Hitung: {formatRupiah(s.closingCounted ?? 0)}</span>
                  <span className={variance === 0 ? "text-muted" : variance > 0 ? "text-success" : "text-danger"}>
                    {variance > 0 ? "+" : ""}
                    {formatRupiah(variance)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Modal open={cashModal !== null} title={cashModal === "in" ? "Kas Masuk" : "Kas Keluar"} onClose={() => setCashModal(null)}>
        {shift && cashModal && (
          <CashForm
            onSubmit={(amount, note) => {
              addCash(shift.id, cashModal, amount, note);
              setCashModal(null);
            }}
            onCancel={() => setCashModal(null)}
          />
        )}
      </Modal>

      <Modal open={closing} title="Tutup Shift" onClose={() => setClosing(false)}>
        {shift && (
          <CloseForm
            expected={expected}
            onSubmit={(counted) => {
              close(shift.id, counted, expected);
              setClosing(false);
            }}
            onCancel={() => setClosing(false)}
          />
        )}
      </Modal>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted">{label}</span>
      <span className={strong ? "font-semibold text-fg" : "text-fg"}>{value}</span>
    </div>
  );
}

const field =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg outline-none focus:border-primary";

function CashForm({ onSubmit, onCancel }: { onSubmit: (amount: number, note: string | null) => void; onCancel: () => void }) {
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (amount > 0) onSubmit(amount, note.trim() || null);
      }}
      className="space-y-3"
    >
      <label className="block text-sm">
        <span className="text-muted">Jumlah</span>
        <input type="number" min={0} value={amount || ""} onChange={(e) => setAmount(Number(e.target.value) || 0)} className={field} autoFocus />
      </label>
      <label className="block text-sm">
        <span className="text-muted">Catatan (opsional)</span>
        <input value={note} onChange={(e) => setNote(e.target.value)} className={field} />
      </label>
      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={onCancel} className="flex-1">Batal</Button>
        <Button type="submit" variant="primary" className="flex-1">Simpan</Button>
      </div>
    </form>
  );
}

function CloseForm({ expected, onSubmit, onCancel }: { expected: number; onSubmit: (counted: number) => void; onCancel: () => void }) {
  const [counted, setCounted] = useState(expected);
  const { variance } = reconcileShift({ openingCash: 0, cashSalesTotal: expected, cashIn: 0, cashOut: 0, counted });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(counted);
      }}
      className="space-y-3"
    >
      <p className="text-sm text-muted">
        Kas seharusnya: <span className="font-semibold text-fg">{formatRupiah(expected)}</span>
      </p>
      <label className="block text-sm">
        <span className="text-muted">Kas fisik dihitung</span>
        <input type="number" min={0} value={counted || ""} onChange={(e) => setCounted(Number(e.target.value) || 0)} className={field} autoFocus />
      </label>
      <p className={`text-sm ${variance === 0 ? "text-muted" : variance > 0 ? "text-success" : "text-danger"}`}>
        Selisih: {variance > 0 ? "+" : ""}
        {formatRupiah(variance)}
      </p>
      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={onCancel} className="flex-1">Batal</Button>
        <Button type="submit" variant="danger" className="flex-1">Tutup shift</Button>
      </div>
    </form>
  );
}
