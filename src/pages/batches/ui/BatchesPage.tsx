import { useState } from "react";
import { CalendarClock, Plus, Trash2 } from "lucide-react";
import { useCatalogStore } from "@/entities/product";
import { recordStockMovement } from "@/entities/stock-ledger";
import { expiredBatches, useBatchStore, type Batch } from "@/entities/batch";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";

export function BatchesPage() {
  const products = useCatalogStore((s) => s.products);
  const batches = useBatchStore((s) => s.batches);
  const add = useBatchStore((s) => s.add);
  const remove = useBatchStore((s) => s.remove);
  const [creating, setCreating] = useState(false);

  const tracked = products.filter((p) => p.trackBatch);
  const name = (id: string) => products.find((p) => p.id === id)?.name ?? id;
  const expiredIds = new Set(expiredBatches(batches, new Date()).map((b) => b.id));
  const sorted = [...batches].sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));

  function addBatch(b: Batch) {
    add(b);
    recordStockMovement({ productId: b.productId, type: "manual_in", qty: b.qty, unitCost: b.unitCost, refType: "batch", refId: b.id });
  }
  function removeBatch(b: Batch) {
    if (b.qty > 0) {
      recordStockMovement({ productId: b.productId, type: "manual_out", qty: -b.qty, unitCost: b.unitCost, refType: "batch", refId: b.id, note: "write-off batch" });
    }
    remove(b.id);
  }

  return (
    <div className="h-full overflow-auto p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-fg">Batch &amp; Kadaluarsa</h1>
          <p className="text-sm text-muted">Penjualan mengambil batch paling dekat kadaluarsa (FEFO).</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setCreating(true)} disabled={tracked.length === 0}>
          <Plus className="h-4 w-4" />
          Tambah batch
        </Button>
      </div>

      {tracked.length === 0 && (
        <p className="mb-3 text-sm text-muted">
          Aktifkan "Lacak batch &amp; kadaluarsa" pada produk (di Katalog) untuk memakai fitur ini.
        </p>
      )}

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-16 text-muted">
          <CalendarClock className="h-10 w-10" strokeWidth={1.5} />
          <p className="text-sm">Belum ada batch.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="bg-surface-2 text-left text-muted">
              <tr>
                <th className="px-3 py-2.5 font-medium">Produk</th>
                <th className="px-3 py-2.5 font-medium">No. Batch</th>
                <th className="px-3 py-2.5 font-medium">Kadaluarsa</th>
                <th className="px-3 py-2.5 text-right font-medium">Sisa</th>
                <th className="px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((b) => {
                const expired = expiredIds.has(b.id);
                return (
                  <tr key={b.id} className="border-t border-border">
                    <td className="px-3 py-2.5 font-medium text-fg">{name(b.productId)}</td>
                    <td className="px-3 py-2.5 text-muted">{b.batchNo || "—"}</td>
                    <td className={`px-3 py-2.5 ${expired ? "font-medium text-danger" : "text-muted"}`}>
                      {b.expiryDate}
                      {expired && " (kadaluarsa)"}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-fg">{b.qty}</td>
                    <td className="px-3 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => removeBatch(b)}
                        aria-label="Hapus / write-off batch"
                        className="cursor-pointer rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-danger"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={creating} title="Tambah Batch" onClose={() => setCreating(false)}>
        <BatchForm
          products={tracked.map((p) => ({ id: p.id, name: p.name }))}
          onDone={(b) => {
            if (b) addBatch(b);
            setCreating(false);
          }}
        />
      </Modal>
    </div>
  );
}

function BatchForm({
  products,
  onDone,
}: {
  products: { id: string; name: string }[];
  onDone: (b: Batch | null) => void;
}) {
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [batchNo, setBatchNo] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [qty, setQty] = useState(0);
  const [unitCost, setUnitCost] = useState(0);

  const field =
    "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg outline-none focus:border-primary";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!productId || !expiryDate || qty <= 0) return;
    onDone({
      id: crypto.randomUUID(),
      productId,
      batchNo: batchNo.trim() || null,
      expiryDate,
      qty: Math.round(qty),
      unitCost: unitCost > 0 ? Math.round(unitCost) : null,
    });
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block text-sm">
        <span className="text-muted">Produk</span>
        <select value={productId} onChange={(e) => setProductId(e.target.value)} className={field}>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm">
          <span className="text-muted">No. batch (opsional)</span>
          <input value={batchNo} onChange={(e) => setBatchNo(e.target.value)} className={field} />
        </label>
        <label className="block text-sm">
          <span className="text-muted">Kadaluarsa</span>
          <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className={field} />
        </label>
        <label className="block text-sm">
          <span className="text-muted">Jumlah</span>
          <input type="number" min={1} value={qty || ""} onChange={(e) => setQty(Number(e.target.value) || 0)} className={field} />
        </label>
        <label className="block text-sm">
          <span className="text-muted">Harga beli (opsional)</span>
          <input type="number" min={0} value={unitCost || ""} onChange={(e) => setUnitCost(Number(e.target.value) || 0)} className={field} />
        </label>
      </div>
      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={() => onDone(null)} className="flex-1">Batal</Button>
        <Button type="submit" variant="primary" className="flex-1">Simpan</Button>
      </div>
    </form>
  );
}
