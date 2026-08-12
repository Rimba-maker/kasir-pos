import { useState } from "react";
import { Pencil, Plus, Trash2, Users, Wallet } from "lucide-react";
import { DEFAULT_PRICE_TIERS } from "@/entities/product";
import { customerBalance, useCustomerStore, type Customer } from "@/entities/customer";
import { customerPoints, lifetimePoints, tierFor, useLoyaltyStore } from "@/entities/loyalty";
import { useSalesStore } from "@/entities/transaction";
import { formatRupiah } from "@/shared/lib/currency";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";

export function CustomersPage() {
  const customers = useCustomerStore((s) => s.customers);
  const payments = useCustomerStore((s) => s.payments);
  const upsert = useCustomerStore((s) => s.upsert);
  const remove = useCustomerStore((s) => s.remove);
  const addPayment = useCustomerStore((s) => s.addPayment);
  const transactions = useSalesStore((s) => s.transactions);
  const pointEntries = useLoyaltyStore((s) => s.pointEntries);
  const tiers = useLoyaltyStore((s) => s.tiers);
  const [editing, setEditing] = useState<Customer | null | undefined>(undefined);
  const [paying, setPaying] = useState<Customer | null>(null);

  const balanceOf = (id: string) => customerBalance(transactions, payments, id);
  const pointsOf = (id: string) => customerPoints(pointEntries, id);
  const tierOf = (id: string) => tierFor(lifetimePoints(pointEntries, id), tiers)?.name ?? "—";
  const tierName = (id?: string | null) => DEFAULT_PRICE_TIERS.find((t) => t.id === id)?.name ?? "Umum";

  return (
    <div className="h-full overflow-auto p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-fg">Pelanggan</h1>
        <Button variant="primary" size="sm" onClick={() => setEditing(null)}>
          <Plus className="h-4 w-4" />
          Tambah pelanggan
        </Button>
      </div>

      {customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-16 text-muted">
          <Users className="h-10 w-10" strokeWidth={1.5} />
          <p className="text-sm">Belum ada pelanggan.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-surface-2 text-left text-muted">
              <tr>
                <th className="px-3 py-2.5 font-medium">Nama</th>
                <th className="px-3 py-2.5 font-medium">Telepon</th>
                <th className="px-3 py-2.5 font-medium">Tier</th>
                <th className="px-3 py-2.5 text-right font-medium">Poin</th>
                <th className="px-3 py-2.5 text-right font-medium">Piutang</th>
                <th className="px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="px-3 py-2.5 font-medium text-fg">{c.name}</td>
                  <td className="px-3 py-2.5 text-muted">{c.phone || "—"}</td>
                  <td className="px-3 py-2.5 text-muted">{tierName(c.priceTierId)} · {tierOf(c.id)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-muted">{pointsOf(c.id)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-fg">{formatRupiah(balanceOf(c.id))}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex justify-end gap-1">
                      <button type="button" onClick={() => setPaying(c)} aria-label={`Bayar ${c.name}`} title="Terima pembayaran" className="cursor-pointer rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-primary">
                        <Wallet className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => setEditing(c)} aria-label={`Ubah ${c.name}`} className="cursor-pointer rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-fg">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => remove(c.id)} aria-label={`Hapus ${c.name}`} className="cursor-pointer rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-danger">
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

      <Modal open={editing !== undefined} title={editing ? "Ubah Pelanggan" : "Tambah Pelanggan"} onClose={() => setEditing(undefined)}>
        <CustomerForm
          customer={editing ?? null}
          onDone={(c) => {
            if (c) upsert(c);
            setEditing(undefined);
          }}
        />
      </Modal>

      <Modal open={paying !== null} title={`Terima Pembayaran — ${paying?.name ?? ""}`} onClose={() => setPaying(null)}>
        {paying && (
          <PaymentForm
            balance={balanceOf(paying.id)}
            onSubmit={(amount) => {
              addPayment({ id: crypto.randomUUID(), customerId: paying.id, txId: null, amount, at: new Date().toISOString(), method: null, note: null });
              setPaying(null);
            }}
            onCancel={() => setPaying(null)}
          />
        )}
      </Modal>
    </div>
  );
}

const field =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg outline-none focus:border-primary";

function CustomerForm({ customer, onDone }: { customer: Customer | null; onDone: (c: Customer | null) => void }) {
  const [name, setName] = useState(customer?.name ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [address, setAddress] = useState(customer?.address ?? "");
  const [city, setCity] = useState(customer?.city ?? "");
  const [priceTierId, setPriceTierId] = useState(customer?.priceTierId ?? "");
  const [tags, setTags] = useState((customer?.tags ?? []).join(", "));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onDone({
      id: customer?.id ?? crypto.randomUUID(),
      name: name.trim(),
      phone: phone.trim() || null,
      address: address.trim() || null,
      city: city.trim() || null,
      priceTierId: priceTierId || null,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      note: customer?.note ?? null,
    });
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block text-sm">
        <span className="text-muted">Nama</span>
        <input value={name} onChange={(e) => setName(e.target.value)} className={field} autoFocus />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm">
          <span className="text-muted">Telepon</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className={field} />
        </label>
        <label className="block text-sm">
          <span className="text-muted">Kota</span>
          <input value={city} onChange={(e) => setCity(e.target.value)} className={field} />
        </label>
      </div>
      <label className="block text-sm">
        <span className="text-muted">Alamat</span>
        <input value={address} onChange={(e) => setAddress(e.target.value)} className={field} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm">
          <span className="text-muted">Tier harga</span>
          <select value={priceTierId} onChange={(e) => setPriceTierId(e.target.value)} className={field}>
            <option value="">Umum</option>
            {DEFAULT_PRICE_TIERS.filter((t) => t.id !== "umum").map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-muted">Segmen (pisah koma)</span>
          <input value={tags} onChange={(e) => setTags(e.target.value)} className={field} />
        </label>
      </div>
      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={() => onDone(null)} className="flex-1">Batal</Button>
        <Button type="submit" variant="primary" className="flex-1">Simpan</Button>
      </div>
    </form>
  );
}

function PaymentForm({ balance, onSubmit, onCancel }: { balance: number; onSubmit: (amount: number) => void; onCancel: () => void }) {
  const [amount, setAmount] = useState(Math.max(0, balance));
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const a = Math.max(0, Math.round(amount));
        if (a > 0) onSubmit(a);
      }}
      className="space-y-3"
    >
      <p className="text-sm text-muted">
        Sisa piutang: <span className="font-semibold text-fg">{formatRupiah(balance)}</span>
      </p>
      <label className="block text-sm">
        <span className="text-muted">Jumlah bayar</span>
        <input type="number" min={0} value={amount || ""} onChange={(e) => setAmount(Number(e.target.value) || 0)} className={field} autoFocus />
      </label>
      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={onCancel} className="flex-1">Batal</Button>
        <Button type="submit" variant="primary" className="flex-1">Simpan</Button>
      </div>
    </form>
  );
}
