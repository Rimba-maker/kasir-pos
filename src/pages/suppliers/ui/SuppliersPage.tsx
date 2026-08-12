import { useState } from "react";
import { Pencil, Plus, Trash2, Truck, Wallet } from "lucide-react";
import { supplierPaid, useSupplierStore, type Supplier } from "@/entities/supplier";
import { poPayables, supplierReturnsValue, usePurchaseStore } from "@/entities/purchase";
import { formatRupiah } from "@/shared/lib/currency";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";

export function SuppliersPage() {
  const suppliers = useSupplierStore((s) => s.suppliers);
  const payments = useSupplierStore((s) => s.payments);
  const upsert = useSupplierStore((s) => s.upsert);
  const remove = useSupplierStore((s) => s.remove);
  const addPayment = useSupplierStore((s) => s.addPayment);
  const orders = usePurchaseStore((s) => s.orders);
  const receipts = usePurchaseStore((s) => s.receipts);
  const returns = usePurchaseStore((s) => s.returns);
  const [editing, setEditing] = useState<Supplier | null | undefined>(undefined); // undefined = closed
  const [paying, setPaying] = useState<Supplier | null>(null);

  const supplierByPo = new Map(orders.map((o) => [o.id, o.supplierId]));
  const balanceOf = (supplierId: string) => {
    const rec = receipts.filter((r) => supplierByPo.get(r.poId) === supplierId);
    const charged = poPayables(orders, rec).reduce((sum, p) => sum + p.amount, 0);
    return charged - supplierPaid(payments, supplierId) - supplierReturnsValue(returns, supplierId);
  };

  return (
    <div className="h-full overflow-auto p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-fg">Supplier</h1>
        <Button variant="primary" size="sm" onClick={() => setEditing(null)}>
          <Plus className="h-4 w-4" />
          Tambah supplier
        </Button>
      </div>

      {suppliers.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-16 text-muted">
          <Truck className="h-10 w-10" strokeWidth={1.5} />
          <p className="text-sm">Belum ada supplier.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[480px] text-sm">
            <thead className="bg-surface-2 text-left text-muted">
              <tr>
                <th className="px-3 py-2.5 font-medium">Nama</th>
                <th className="px-3 py-2.5 font-medium">Telepon</th>
                <th className="px-3 py-2.5 text-right font-medium">Hutang</th>
                <th className="px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="px-3 py-2.5 font-medium text-fg">{s.name}</td>
                  <td className="px-3 py-2.5 text-muted">{s.phone || "—"}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-fg">{formatRupiah(balanceOf(s.id))}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setPaying(s)}
                        aria-label={`Bayar ${s.name}`}
                        title="Catat pembayaran"
                        className="cursor-pointer rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-primary"
                      >
                        <Wallet className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(s)}
                        aria-label={`Ubah ${s.name}`}
                        className="cursor-pointer rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-fg"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(s.id)}
                        aria-label={`Hapus ${s.name}`}
                        className="cursor-pointer rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-danger"
                      >
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

      <Modal
        open={editing !== undefined}
        title={editing ? "Ubah Supplier" : "Tambah Supplier"}
        onClose={() => setEditing(undefined)}
      >
        <SupplierForm
          supplier={editing ?? null}
          onDone={(s) => {
            if (s) upsert(s);
            setEditing(undefined);
          }}
        />
      </Modal>

      <Modal open={paying !== null} title={`Bayar ${paying?.name ?? ""}`} onClose={() => setPaying(null)}>
        {paying && (
          <PaymentForm
            balance={balanceOf(paying.id)}
            onSubmit={(amount) => {
              addPayment({
                id: crypto.randomUUID(),
                supplierId: paying.id,
                poId: null,
                amount,
                at: new Date().toISOString(),
                method: null,
                note: null,
              });
              setPaying(null);
            }}
            onCancel={() => setPaying(null)}
          />
        )}
      </Modal>
    </div>
  );
}

function PaymentForm({
  balance,
  onSubmit,
  onCancel,
}: {
  balance: number;
  onSubmit: (amount: number) => void;
  onCancel: () => void;
}) {
  const [amount, setAmount] = useState(Math.max(0, balance));
  const field =
    "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg outline-none focus:border-primary";
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
        Sisa hutang: <span className="font-semibold text-fg">{formatRupiah(balance)}</span>
      </p>
      <label className="block text-sm">
        <span className="text-muted">Jumlah bayar</span>
        <input
          type="number"
          min={0}
          value={amount || ""}
          onChange={(e) => setAmount(Number(e.target.value) || 0)}
          className={field}
          autoFocus
        />
      </label>
      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Batal
        </Button>
        <Button type="submit" variant="primary" className="flex-1">
          Simpan
        </Button>
      </div>
    </form>
  );
}

function SupplierForm({
  supplier,
  onDone,
}: {
  supplier: Supplier | null;
  onDone: (s: Supplier | null) => void;
}) {
  const [name, setName] = useState(supplier?.name ?? "");
  const [phone, setPhone] = useState(supplier?.phone ?? "");
  const [address, setAddress] = useState(supplier?.address ?? "");
  const [note, setNote] = useState(supplier?.note ?? "");

  const field =
    "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg outline-none focus:border-primary";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onDone({
      id: supplier?.id ?? crypto.randomUUID(),
      name: name.trim(),
      phone: phone.trim() || null,
      address: address.trim() || null,
      note: note.trim() || null,
    });
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block text-sm">
        <span className="text-muted">Nama supplier</span>
        <input value={name} onChange={(e) => setName(e.target.value)} className={field} autoFocus />
      </label>
      <label className="block text-sm">
        <span className="text-muted">Telepon (opsional)</span>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} className={field} />
      </label>
      <label className="block text-sm">
        <span className="text-muted">Alamat (opsional)</span>
        <input value={address} onChange={(e) => setAddress(e.target.value)} className={field} />
      </label>
      <label className="block text-sm">
        <span className="text-muted">Catatan (opsional)</span>
        <input value={note} onChange={(e) => setNote(e.target.value)} className={field} />
      </label>
      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={() => onDone(null)} className="flex-1">
          Batal
        </Button>
        <Button type="submit" variant="primary" className="flex-1">
          Simpan
        </Button>
      </div>
    </form>
  );
}
