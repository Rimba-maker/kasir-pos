import { useState } from "react";
import { Plus, Tag, Trash2 } from "lucide-react";
import { useCatalogStore } from "@/entities/product";
import { usePromoStore, type Promo, type PromoType } from "@/entities/promo";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";

const TYPE_LABEL: Record<PromoType, string> = {
  percent: "Diskon %",
  nominal: "Diskon nominal",
  qty_break: "Diskon grosir (qty)",
  bundle: "Bundle",
  buy_x_get_y: "Beli X gratis Y",
};

export function PromosPage() {
  const promos = usePromoStore((s) => s.promos);
  const upsert = usePromoStore((s) => s.upsert);
  const remove = usePromoStore((s) => s.remove);
  const [editing, setEditing] = useState<Promo | null | undefined>(undefined);

  return (
    <div className="h-full overflow-auto p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-fg">Promo</h1>
        <Button variant="primary" size="sm" onClick={() => setEditing(null)}>
          <Plus className="h-4 w-4" />
          Tambah promo
        </Button>
      </div>

      {promos.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-16 text-muted">
          <Tag className="h-10 w-10" strokeWidth={1.5} />
          <p className="text-sm">Belum ada promo.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[480px] text-sm">
            <thead className="bg-surface-2 text-left text-muted">
              <tr>
                <th className="px-3 py-2.5 font-medium">Nama</th>
                <th className="px-3 py-2.5 font-medium">Tipe</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
                <th className="px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {promos.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-3 py-2.5 font-medium text-fg">{p.name}</td>
                  <td className="px-3 py-2.5 text-muted">{TYPE_LABEL[p.type]}</td>
                  <td className="px-3 py-2.5">
                    <span className={p.active ? "badge badge-success" : "badge"}>{p.active ? "Aktif" : "Nonaktif"}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex justify-end gap-1">
                      <button type="button" onClick={() => setEditing(p)} className="cursor-pointer rounded-lg px-2 py-1 text-xs text-primary hover:underline">
                        Ubah
                      </button>
                      <button type="button" onClick={() => remove(p.id)} aria-label={`Hapus ${p.name}`} className="cursor-pointer rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-danger">
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

      <Modal open={editing !== undefined} title={editing ? "Ubah Promo" : "Tambah Promo"} onClose={() => setEditing(undefined)}>
        <PromoForm
          promo={editing ?? null}
          onDone={(p) => {
            if (p) upsert(p);
            setEditing(undefined);
          }}
        />
      </Modal>
    </div>
  );
}

const field =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg outline-none focus:border-primary";

function PromoForm({ promo, onDone }: { promo: Promo | null; onDone: (p: Promo | null) => void }) {
  const products = useCatalogStore((s) => s.products);
  const [name, setName] = useState(promo?.name ?? "");
  const [type, setType] = useState<PromoType>(promo?.type ?? "percent");
  const [active, setActive] = useState(promo?.active ?? true);
  const [productId, setProductId] = useState(promo?.productId ?? "");
  const [productId2, setProductId2] = useState(promo?.productIds?.[1] ?? "");
  const [percent, setPercent] = useState(Math.round((promo?.percent ?? 0) * 100));
  const [amount, setAmount] = useState(promo?.amount ?? 0);
  const [minQty, setMinQty] = useState(promo?.minQty ?? 0);
  const [freeQty, setFreeQty] = useState(promo?.freeQty ?? 0);

  const needsProduct = type === "qty_break" || type === "buy_x_get_y";
  const scopedProduct = type === "percent" || type === "nominal";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onDone({
      id: promo?.id ?? crypto.randomUUID(),
      name: name.trim(),
      active,
      type,
      productId: needsProduct || (scopedProduct && productId) ? productId || null : null,
      productIds: type === "bundle" ? [productId, productId2].filter(Boolean) : undefined,
      percent: type === "percent" ? Math.max(0, percent) / 100 : undefined,
      amount: type === "nominal" || type === "qty_break" || type === "bundle" ? Math.max(0, Math.round(amount)) : undefined,
      minQty: type === "qty_break" || type === "buy_x_get_y" ? Math.max(1, Math.round(minQty)) : undefined,
      freeQty: type === "buy_x_get_y" ? Math.max(1, Math.round(freeQty)) : undefined,
    });
  }

  const ProductSelect = ({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) => (
    <label className="block text-sm">
      <span className="text-muted">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={field}>
        {scopedProduct && <option value="">Seluruh keranjang</option>}
        {products.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
    </label>
  );

  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block text-sm">
        <span className="text-muted">Nama promo</span>
        <input value={name} onChange={(e) => setName(e.target.value)} className={field} autoFocus />
      </label>
      <label className="block text-sm">
        <span className="text-muted">Tipe</span>
        <select value={type} onChange={(e) => setType(e.target.value as PromoType)} className={field}>
          {Object.entries(TYPE_LABEL).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </label>

      {(scopedProduct || needsProduct) && (
        <ProductSelect value={productId} onChange={setProductId} label={scopedProduct ? "Berlaku untuk" : "Produk"} />
      )}
      {type === "bundle" && (
        <>
          <ProductSelect value={productId} onChange={setProductId} label="Produk 1" />
          <ProductSelect value={productId2} onChange={setProductId2} label="Produk 2" />
        </>
      )}

      <div className="grid grid-cols-2 gap-3">
        {type === "percent" && (
          <label className="block text-sm">
            <span className="text-muted">Diskon (%)</span>
            <input type="number" min={0} max={100} value={percent || ""} onChange={(e) => setPercent(Number(e.target.value) || 0)} className={field} />
          </label>
        )}
        {(type === "nominal" || type === "qty_break" || type === "bundle") && (
          <label className="block text-sm">
            <span className="text-muted">{type === "qty_break" ? "Potongan / unit" : "Potongan (Rp)"}</span>
            <input type="number" min={0} value={amount || ""} onChange={(e) => setAmount(Number(e.target.value) || 0)} className={field} />
          </label>
        )}
        {(type === "qty_break" || type === "buy_x_get_y") && (
          <label className="block text-sm">
            <span className="text-muted">Min. qty</span>
            <input type="number" min={1} value={minQty || ""} onChange={(e) => setMinQty(Number(e.target.value) || 0)} className={field} />
          </label>
        )}
        {type === "buy_x_get_y" && (
          <label className="block text-sm">
            <span className="text-muted">Gratis (unit)</span>
            <input type="number" min={1} value={freeQty || ""} onChange={(e) => setFreeQty(Number(e.target.value) || 0)} className={field} />
          </label>
        )}
      </div>

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
