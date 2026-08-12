import { useState } from "react";
import { Plus, Ticket, Trash2 } from "lucide-react";
import { useLoyaltyStore, type Voucher } from "@/entities/loyalty";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";

const field =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg outline-none focus:border-primary";

export function LoyaltyPage() {
  const config = useLoyaltyStore((s) => s.config);
  const tiers = useLoyaltyStore((s) => s.tiers);
  const vouchers = useLoyaltyStore((s) => s.vouchers);
  const setConfig = useLoyaltyStore((s) => s.setConfig);
  const upsertVoucher = useLoyaltyStore((s) => s.upsertVoucher);
  const removeVoucher = useLoyaltyStore((s) => s.removeVoucher);

  const [earnPer, setEarnPer] = useState(config.earnPer);
  const [redeemValue, setRedeemValue] = useState(config.redeemValue);
  const [editing, setEditing] = useState<Voucher | null | undefined>(undefined);

  return (
    <div className="h-full overflow-auto p-4 sm:p-5">
      <h1 className="mb-4 text-xl font-bold text-fg">Loyalty</h1>

      <div className="grid max-w-3xl gap-4 md:grid-cols-2">
        <section className="space-y-3 rounded-xl border border-border bg-surface p-4">
          <h2 className="font-semibold text-fg">Poin</h2>
          <label className="block text-sm">
            <span className="text-muted">Rupiah per 1 poin (earn)</span>
            <input type="number" min={1} value={earnPer || ""} onChange={(e) => setEarnPer(Number(e.target.value) || 0)} className={field} />
          </label>
          <label className="block text-sm">
            <span className="text-muted">Nilai 1 poin saat ditukar (Rp)</span>
            <input type="number" min={0} value={redeemValue || ""} onChange={(e) => setRedeemValue(Number(e.target.value) || 0)} className={field} />
          </label>
          <Button variant="primary" size="sm" onClick={() => setConfig({ earnPer: Math.max(1, Math.round(earnPer)), redeemValue: Math.max(0, Math.round(redeemValue)) })}>
            Simpan
          </Button>
        </section>

        <section className="space-y-2 rounded-xl border border-border bg-surface p-4">
          <h2 className="font-semibold text-fg">Tier member</h2>
          {tiers
            .slice()
            .sort((a, b) => a.minLifetimePoints - b.minLifetimePoints)
            .map((t) => (
              <div key={t.id} className="flex items-center justify-between text-sm">
                <span className="text-fg">{t.name}</span>
                <span className="text-muted">≥ {t.minLifetimePoints} poin</span>
              </div>
            ))}
        </section>
      </div>

      <div className="mt-6 max-w-3xl">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold text-fg">Voucher</h2>
          <Button variant="outline" size="sm" onClick={() => setEditing(null)}>
            <Plus className="h-4 w-4" />
            Tambah voucher
          </Button>
        </div>
        {vouchers.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-10 text-muted">
            <Ticket className="h-8 w-8" strokeWidth={1.5} />
            <p className="text-sm">Belum ada voucher.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[420px] text-sm">
              <thead className="bg-surface-2 text-left text-muted">
                <tr>
                  <th className="px-3 py-2.5 font-medium">Kode</th>
                  <th className="px-3 py-2.5 font-medium">Nilai</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-3 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {vouchers.map((v) => (
                  <tr key={v.id} className="border-t border-border">
                    <td className="px-3 py-2.5 font-medium text-fg">{v.code}</td>
                    <td className="px-3 py-2.5 text-muted">{v.type === "percent" ? `${v.value}%` : `Rp ${v.value.toLocaleString("id-ID")}`}</td>
                    <td className="px-3 py-2.5">
                      <span className={v.active ? "badge badge-success" : "badge"}>{v.active ? "Aktif" : "Nonaktif"}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex justify-end gap-1">
                        <button type="button" onClick={() => setEditing(v)} className="cursor-pointer px-2 py-1 text-xs text-primary hover:underline">Ubah</button>
                        <button type="button" onClick={() => removeVoucher(v.id)} aria-label={`Hapus ${v.code}`} className="cursor-pointer rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-danger">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={editing !== undefined} title={editing ? "Ubah Voucher" : "Tambah Voucher"} onClose={() => setEditing(undefined)}>
        <VoucherForm
          voucher={editing ?? null}
          onDone={(v) => {
            if (v) upsertVoucher(v);
            setEditing(undefined);
          }}
        />
      </Modal>
    </div>
  );
}

function VoucherForm({ voucher, onDone }: { voucher: Voucher | null; onDone: (v: Voucher | null) => void }) {
  const [code, setCode] = useState(voucher?.code ?? "");
  const [type, setType] = useState<"percent" | "nominal">(voucher?.type ?? "percent");
  const [value, setValue] = useState(voucher?.value ?? 0);
  const [active, setActive] = useState(voucher?.active ?? true);
  const [expiry, setExpiry] = useState(voucher?.expiry ?? "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || value <= 0) return;
    onDone({
      id: voucher?.id ?? crypto.randomUUID(),
      code: code.trim().toUpperCase(),
      type,
      value: Math.max(0, Math.round(value)),
      active,
      expiry: expiry || null,
      customerId: voucher?.customerId ?? null,
    });
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block text-sm">
        <span className="text-muted">Kode</span>
        <input value={code} onChange={(e) => setCode(e.target.value)} className={field} autoFocus />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm">
          <span className="text-muted">Tipe</span>
          <select value={type} onChange={(e) => setType(e.target.value as "percent" | "nominal")} className={field}>
            <option value="percent">Persen (%)</option>
            <option value="nominal">Nominal (Rp)</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-muted">Nilai</span>
          <input type="number" min={0} value={value || ""} onChange={(e) => setValue(Number(e.target.value) || 0)} className={field} />
        </label>
      </div>
      <label className="block text-sm">
        <span className="text-muted">Kadaluarsa (opsional)</span>
        <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} className={field} />
      </label>
      <label className="flex items-center gap-2 text-sm text-fg">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="accent-[var(--color-primary)]" />
        Aktif
      </label>
      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={() => onDone(null)} className="flex-1">Batal</Button>
        <Button type="submit" variant="primary" className="flex-1">Simpan</Button>
      </div>
    </form>
  );
}
