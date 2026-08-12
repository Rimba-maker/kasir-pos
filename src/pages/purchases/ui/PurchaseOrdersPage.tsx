import { useState } from "react";
import { PackagePlus, Plus, Trash2 } from "lucide-react";
import { toBaseQty, useCatalogStore } from "@/entities/product";
import { useSupplierStore } from "@/entities/supplier";
import {
  orderedBase,
  poStatus,
  receivedBase,
  receivePurchase,
  returnPurchase,
  usePurchaseStore,
  type POLine,
  type PurchaseOrder,
} from "@/entities/purchase";
import { formatRupiah } from "@/shared/lib/currency";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";

const STATUS_STYLE: Record<string, string> = {
  draft: "badge",
  ordered: "badge badge-warning",
  partial: "badge badge-warning",
  completed: "badge badge-success",
};

export function PurchaseOrdersPage() {
  const orders = usePurchaseStore((s) => s.orders);
  const receipts = usePurchaseStore((s) => s.receipts);
  const suppliers = useSupplierStore((s) => s.suppliers);
  const [creating, setCreating] = useState(false);
  const [receiving, setReceiving] = useState<PurchaseOrder | null>(null);
  const [returning, setReturning] = useState<PurchaseOrder | null>(null);

  const supplierName = (id: string) => suppliers.find((s) => s.id === id)?.name ?? "—";
  const poTotal = (po: PurchaseOrder) => po.lines.reduce((sum, l) => sum + l.qty * l.unitCost, 0);

  return (
    <div className="h-full overflow-auto p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-fg">Purchase Order</h1>
        <Button variant="primary" size="sm" onClick={() => setCreating(true)} disabled={suppliers.length === 0}>
          <Plus className="h-4 w-4" />
          Buat PO
        </Button>
      </div>

      {suppliers.length === 0 && (
        <p className="mb-3 text-sm text-muted">Tambah supplier dulu sebelum membuat PO.</p>
      )}

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-16 text-muted">
          <PackagePlus className="h-10 w-10" strokeWidth={1.5} />
          <p className="text-sm">Belum ada purchase order.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-surface-2 text-left text-muted">
              <tr>
                <th className="px-3 py-2.5 font-medium">Supplier</th>
                <th className="px-3 py-2.5 font-medium">Tanggal</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
                <th className="px-3 py-2.5 text-right font-medium">Total</th>
                <th className="px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((po) => {
                const status = poStatus(po, receipts);
                return (
                  <tr key={po.id} className="border-t border-border">
                    <td className="px-3 py-2.5 font-medium text-fg">{supplierName(po.supplierId)}</td>
                    <td className="px-3 py-2.5 text-muted">{po.createdAt.slice(0, 10)}</td>
                    <td className="px-3 py-2.5">
                      <span className={STATUS_STYLE[status]}>{status}</span>
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-fg">{formatRupiah(poTotal(po))}</td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex justify-end gap-1.5">
                        {status !== "completed" && status !== "draft" && (
                          <Button variant="outline" size="sm" onClick={() => setReceiving(po)}>
                            Terima
                          </Button>
                        )}
                        {(status === "partial" || status === "completed") && (
                          <Button variant="outline" size="sm" onClick={() => setReturning(po)}>
                            Retur
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={creating} title="Buat Purchase Order" onClose={() => setCreating(false)}>
        <POForm onDone={() => setCreating(false)} />
      </Modal>
      <Modal open={receiving !== null} title="Terima Barang" onClose={() => setReceiving(null)}>
        {receiving && <ReceiveForm po={receiving} onDone={() => setReceiving(null)} />}
      </Modal>
      <Modal open={returning !== null} title="Retur ke Supplier" onClose={() => setReturning(null)}>
        {returning && <ReturnForm po={returning} onDone={() => setReturning(null)} />}
      </Modal>
    </div>
  );
}

const field =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg outline-none focus:border-primary";

interface DraftLine {
  productId: string;
  unitName: string;
  qty: number;
  unitCost: number;
}

function POForm({ onDone }: { onDone: () => void }) {
  const suppliers = useSupplierStore((s) => s.suppliers);
  const products = useCatalogStore((s) => s.products);
  const upsertOrder = usePurchaseStore((s) => s.upsertOrder);
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? "");
  const [dueDate, setDueDate] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([]);

  const addLine = () =>
    setLines((ls) => [...ls, { productId: products[0]?.id ?? "", unitName: products[0]?.baseUnit ?? "pcs", qty: 1, unitCost: 0 }]);
  const update = (i: number, patch: Partial<DraftLine>) =>
    setLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  const remove = (i: number) => setLines((ls) => ls.filter((_, j) => j !== i));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const valid = lines.filter((l) => l.productId && l.qty > 0);
    if (!supplierId || valid.length === 0) return;
    const poLines: POLine[] = valid.map((l) => {
      const product = products.find((p) => p.id === l.productId)!;
      return {
        productId: l.productId,
        unitName: l.unitName,
        qty: Math.round(l.qty),
        unitCost: Math.max(0, Math.round(l.unitCost)),
        baseQty: toBaseQty(product, l.unitName, Math.round(l.qty)),
      };
    });
    upsertOrder({
      id: crypto.randomUUID(),
      supplierId,
      status: "ordered",
      createdAt: new Date().toISOString(),
      dueDate: dueDate || null,
      lines: poLines,
    });
    onDone();
  }

  const unitsFor = (productId: string) => {
    const p = products.find((x) => x.id === productId);
    return p ? [p.baseUnit, ...p.units.map((u) => u.name)] : ["pcs"];
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block text-sm">
        <span className="text-muted">Supplier</span>
        <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className={field}>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        <span className="text-muted">Jatuh tempo (opsional)</span>
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={field} />
      </label>

      <div className="text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted">Item</span>
          <button type="button" onClick={addLine} className="cursor-pointer text-xs font-medium text-primary hover:underline" disabled={products.length === 0}>
            + Tambah item
          </button>
        </div>
        <div className="mt-1.5 space-y-2">
          {lines.map((l, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <select value={l.productId} onChange={(e) => update(i, { productId: e.target.value, unitName: unitsFor(e.target.value)[0] })} className={`${field} mt-0 flex-1`}>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <select value={l.unitName} onChange={(e) => update(i, { unitName: e.target.value })} className={`${field} mt-0 w-24`}>
                {unitsFor(l.productId).map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              <input type="number" min={1} value={l.qty || ""} onChange={(e) => update(i, { qty: Number(e.target.value) || 0 })} placeholder="qty" className={`${field} mt-0 w-16`} />
              <input type="number" min={0} value={l.unitCost || ""} onChange={(e) => update(i, { unitCost: Number(e.target.value) || 0 })} placeholder="harga" className={`${field} mt-0 w-24`} />
              <button type="button" onClick={() => remove(i)} aria-label="Hapus item" className="shrink-0 cursor-pointer text-muted hover:text-danger">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={onDone} className="flex-1">Batal</Button>
        <Button type="submit" variant="primary" className="flex-1">Simpan PO</Button>
      </div>
    </form>
  );
}

function ReceiveForm({ po, onDone }: { po: PurchaseOrder; onDone: () => void }) {
  const products = useCatalogStore((s) => s.products);
  const receipts = usePurchaseStore((s) => s.receipts);
  const ordered = orderedBase(po);
  const received = receivedBase(receipts, po.id);

  const rows = Object.keys(ordered).map((productId) => {
    const remaining = Math.max(0, ordered[productId] - (received[productId] ?? 0));
    const line = po.lines.find((l) => l.productId === productId)!;
    const factor = line.qty > 0 ? line.baseQty / line.qty : 1;
    const costPerBase = Math.round(line.unitCost / factor);
    return { productId, remaining, costPerBase };
  });

  const [qtys, setQtys] = useState<Record<string, number>>(
    Object.fromEntries(rows.map((r) => [r.productId, r.remaining])),
  );

  const name = (id: string) => products.find((p) => p.id === id)?.name ?? id;
  const baseUnit = (id: string) => products.find((p) => p.id === id)?.baseUnit ?? "pcs";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const lines = rows
      .map((r) => ({ productId: r.productId, qty: Math.min(qtys[r.productId] ?? 0, r.remaining), unitCost: r.costPerBase }))
      .filter((l) => l.qty > 0);
    if (lines.length === 0) return;
    receivePurchase(po, lines);
    onDone();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {rows.every((r) => r.remaining === 0) ? (
        <p className="text-sm text-muted">Semua item sudah diterima.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.productId} className="flex items-center gap-2 text-sm">
              <span className="flex-1 text-fg">{name(r.productId)}</span>
              <span className="text-xs text-muted">sisa {r.remaining}</span>
              <input
                type="number"
                min={0}
                max={r.remaining}
                value={qtys[r.productId] ?? 0}
                onChange={(e) => setQtys((q) => ({ ...q, [r.productId]: Number(e.target.value) || 0 }))}
                className={`${field} mt-0 w-20`}
                disabled={r.remaining === 0}
              />
              <span className="w-10 text-xs text-muted">{baseUnit(r.productId)}</span>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={onDone} className="flex-1">Batal</Button>
        <Button type="submit" variant="primary" className="flex-1">Terima</Button>
      </div>
    </form>
  );
}

function ReturnForm({ po, onDone }: { po: PurchaseOrder; onDone: () => void }) {
  const products = useCatalogStore((s) => s.products);
  const receipts = usePurchaseStore((s) => s.receipts);
  const received = receivedBase(receipts, po.id);

  const rows = Object.keys(received)
    .map((productId) => {
      const line = po.lines.find((l) => l.productId === productId)!;
      const factor = line.qty > 0 ? line.baseQty / line.qty : 1;
      return { productId, max: received[productId] ?? 0, costPerBase: Math.round(line.unitCost / factor) };
    })
    .filter((r) => r.max > 0);

  const [qtys, setQtys] = useState<Record<string, number>>({});
  const name = (id: string) => products.find((p) => p.id === id)?.name ?? id;
  const baseUnit = (id: string) => products.find((p) => p.id === id)?.baseUnit ?? "pcs";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const lines = rows
      .map((r) => ({ productId: r.productId, qty: Math.min(qtys[r.productId] ?? 0, r.max), unitCost: r.costPerBase }))
      .filter((l) => l.qty > 0);
    if (lines.length === 0) return;
    returnPurchase({ supplierId: po.supplierId, poId: po.id, lines });
    onDone();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {rows.length === 0 ? (
        <p className="text-sm text-muted">Belum ada barang diterima untuk diretur.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.productId} className="flex items-center gap-2 text-sm">
              <span className="flex-1 text-fg">{name(r.productId)}</span>
              <span className="text-xs text-muted">maks {r.max}</span>
              <input
                type="number"
                min={0}
                max={r.max}
                value={qtys[r.productId] ?? 0}
                onChange={(e) => setQtys((q) => ({ ...q, [r.productId]: Number(e.target.value) || 0 }))}
                className={`${field} mt-0 w-20`}
              />
              <span className="w-10 text-xs text-muted">{baseUnit(r.productId)}</span>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={onDone} className="flex-1">Batal</Button>
        <Button type="submit" variant="primary" className="flex-1">Retur</Button>
      </div>
    </form>
  );
}
