import { useState } from "react";
import { ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import {
  sellPrice,
  useCatalogStore,
  type Category,
  type KitComponent,
  type Product,
  type ProductUnit,
} from "@/entities/product";
import { useSupplierStore } from "@/entities/supplier";
import { fileToDataUrl } from "@/shared/lib/image";
import { Button } from "@/shared/ui/Button";
import { saveProduct } from "../model/manage-product";

interface ProductFormProps {
  /** Existing product to edit, or null to create. */
  product: Product | null;
  categories: Category[];
  onDone: () => void;
}

export function ProductForm({ product, categories, onDone }: ProductFormProps) {
  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(product ? sellPrice(product) : 0);
  const [costPrice, setCostPrice] = useState(product?.costPrice ?? 0);
  const [stock, setStock] = useState(product?.stock ?? 0);
  const [baseUnit, setBaseUnit] = useState(product?.baseUnit ?? "pcs");
  const [units, setUnits] = useState<ProductUnit[]>(product?.units ?? []);
  const [trackBatch, setTrackBatch] = useState(product?.trackBatch ?? false);
  const [isKit, setIsKit] = useState(product?.isKit ?? false);
  const [components, setComponents] = useState<KitComponent[]>(product?.components ?? []);
  const [reorderPoint, setReorderPoint] = useState(product?.reorderPoint ?? 0);
  const [reorderQty, setReorderQty] = useState(product?.reorderQty ?? 0);
  const [defaultSupplierId, setDefaultSupplierId] = useState(product?.defaultSupplierId ?? "");
  const allProducts = useCatalogStore((s) => s.products);
  const suppliers = useSupplierStore((s) => s.suppliers);
  const componentChoices = allProducts.filter((p) => p.id !== product?.id && !p.isKit);
  const [categoryId, setCategoryId] = useState<string | null>(product?.categoryId ?? null);
  const [barcode, setBarcode] = useState(product?.barcode ?? "");
  const [imagePath, setImagePath] = useState<string | null>(product?.imagePath ?? null);
  const [loadingImage, setLoadingImage] = useState(false);

  async function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoadingImage(true);
    try {
      setImagePath(await fileToDataUrl(file));
    } catch (err) {
      alert(`Gagal memuat gambar: ${String(err)}`);
    } finally {
      setLoadingImage(false);
      e.target.value = ""; // izinkan pilih file yang sama lagi
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const cost = Math.max(0, Math.round(costPrice));
    await saveProduct({
      id: product?.id ?? crypto.randomUUID(),
      name: name.trim(),
      costPrice: cost > 0 ? cost : null,
      prices: { ...(product?.prices ?? {}), umum: Math.max(0, Math.round(price)) },
      baseUnit: baseUnit.trim() || "pcs",
      units: units
        .filter((u) => u.name.trim() && u.factor > 0)
        .map((u) => ({ name: u.name.trim(), factor: Math.round(u.factor), barcode: u.barcode?.trim() || null })),
      trackBatch,
      isKit,
      components: isKit
        ? components.filter((c) => c.productId && c.qty > 0).map((c) => ({ productId: c.productId, qty: Math.round(c.qty) }))
        : undefined,
      reorderPoint: reorderPoint > 0 ? Math.round(reorderPoint) : null,
      reorderQty: reorderQty > 0 ? Math.round(reorderQty) : null,
      defaultSupplierId: defaultSupplierId || null,
      stock: Math.max(0, Math.round(stock)),
      categoryId,
      barcode: barcode.trim() || null,
      imagePath,
    });
    onDone();
  }

  const updateUnit = (i: number, patch: Partial<ProductUnit>) =>
    setUnits((us) => us.map((u, j) => (j === i ? { ...u, ...patch } : u)));
  const addUnit = () => setUnits((us) => [...us, { name: "", factor: 1 }]);
  const removeUnit = (i: number) => setUnits((us) => us.filter((_, j) => j !== i));

  const updateComp = (i: number, patch: Partial<KitComponent>) =>
    setComponents((cs) => cs.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  const addComp = () =>
    setComponents((cs) => [...cs, { productId: componentChoices[0]?.id ?? "", qty: 1 }]);
  const removeComp = (i: number) => setComponents((cs) => cs.filter((_, j) => j !== i));

  const field =
    "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg outline-none focus:border-primary";

  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block text-sm">
        <span className="text-muted">Nama produk</span>
        <input value={name} onChange={(e) => setName(e.target.value)} className={field} autoFocus />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm">
          <span className="text-muted">Harga jual</span>
          <input
            type="number"
            min={0}
            value={price || ""}
            onChange={(e) => setPrice(Number(e.target.value) || 0)}
            className={field}
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted">Harga beli</span>
          <input
            type="number"
            min={0}
            value={costPrice || ""}
            onChange={(e) => setCostPrice(Number(e.target.value) || 0)}
            className={field}
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted">Stok</span>
          <input
            type="number"
            min={0}
            value={stock || ""}
            onChange={(e) => setStock(Number(e.target.value) || 0)}
            className={field}
          />
        </label>
      </div>
      <label className="block text-sm">
        <span className="text-muted">Kategori</span>
        <select
          value={categoryId ?? ""}
          onChange={(e) => setCategoryId(e.target.value || null)}
          className={field}
        >
          <option value="">Tanpa kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        <span className="text-muted">Barcode (opsional)</span>
        <input value={barcode} onChange={(e) => setBarcode(e.target.value)} className={field} />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm">
          <span className="text-muted">Stok minimum</span>
          <input
            type="number"
            min={0}
            value={reorderPoint || ""}
            onChange={(e) => setReorderPoint(Number(e.target.value) || 0)}
            placeholder="—"
            className={field}
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted">Qty pesan ulang</span>
          <input
            type="number"
            min={0}
            value={reorderQty || ""}
            onChange={(e) => setReorderQty(Number(e.target.value) || 0)}
            placeholder="—"
            className={field}
          />
        </label>
      </div>
      <label className="block text-sm">
        <span className="text-muted">Supplier utama (opsional)</span>
        <select
          value={defaultSupplierId}
          onChange={(e) => setDefaultSupplierId(e.target.value)}
          className={field}
        >
          <option value="">Tanpa supplier</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm">
          <span className="text-muted">Satuan dasar</span>
          <input
            value={baseUnit}
            onChange={(e) => setBaseUnit(e.target.value)}
            placeholder="pcs"
            className={field}
          />
        </label>
      </div>

      <div className="text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted">Satuan tambahan (opsional)</span>
          <button
            type="button"
            onClick={addUnit}
            className="cursor-pointer text-xs font-medium text-primary hover:underline"
          >
            + Tambah satuan
          </button>
        </div>
        {units.length > 0 && (
          <div className="mt-1.5 space-y-2">
            {units.map((u, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={u.name}
                  onChange={(e) => updateUnit(i, { name: e.target.value })}
                  placeholder="box"
                  className={`${field} mt-0 flex-1`}
                />
                <span className="shrink-0 text-xs text-muted">=</span>
                <input
                  type="number"
                  min={1}
                  value={u.factor || ""}
                  onChange={(e) => updateUnit(i, { factor: Number(e.target.value) || 1 })}
                  placeholder="12"
                  className={`${field} mt-0 w-20`}
                />
                <span className="shrink-0 text-xs text-muted">{baseUnit || "pcs"}</span>
                <button
                  type="button"
                  onClick={() => removeUnit(i)}
                  aria-label="Hapus satuan"
                  className="shrink-0 cursor-pointer text-muted transition-colors hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-fg">
        <input
          type="checkbox"
          checked={trackBatch}
          onChange={(e) => setTrackBatch(e.target.checked)}
          className="accent-[var(--color-primary)]"
        />
        Lacak batch &amp; kadaluarsa (FEFO)
      </label>

      <label className="flex items-center gap-2 text-sm text-fg">
        <input
          type="checkbox"
          checked={isKit}
          onChange={(e) => setIsKit(e.target.checked)}
          className="accent-[var(--color-primary)]"
        />
        Produk paket / kit (kurangi komponen saat terjual)
      </label>
      {isKit && (
        <div className="text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted">Komponen</span>
            <button
              type="button"
              onClick={addComp}
              disabled={componentChoices.length === 0}
              className="cursor-pointer text-xs font-medium text-primary hover:underline"
            >
              + Tambah komponen
            </button>
          </div>
          <div className="mt-1.5 space-y-2">
            {components.map((c, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <select
                  value={c.productId}
                  onChange={(e) => updateComp(i, { productId: e.target.value })}
                  className={`${field} mt-0 flex-1`}
                >
                  {componentChoices.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <span className="shrink-0 text-xs text-muted">×</span>
                <input
                  type="number"
                  min={1}
                  value={c.qty || ""}
                  onChange={(e) => updateComp(i, { qty: Number(e.target.value) || 1 })}
                  className={`${field} mt-0 w-16`}
                />
                <button
                  type="button"
                  onClick={() => removeComp(i)}
                  aria-label="Hapus komponen"
                  className="shrink-0 cursor-pointer text-muted hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-sm">
        <span className="text-muted">Foto produk</span>
        <div className="mt-1 flex items-center gap-3">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-2 text-muted/40">
            {loadingImage ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted" />
            ) : imagePath ? (
              <img src={imagePath} alt="" className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="h-6 w-6" strokeWidth={1.5} />
            )}
          </div>
          <div className="flex flex-col items-start gap-1.5">
            <label className="group inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-fg transition duration-150 hover:bg-surface-2 active:scale-[0.97] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50">
              <Upload className="h-4 w-4 text-muted transition-colors group-hover:text-primary" />
              {imagePath ? "Ganti foto" : "Pilih foto"}
              <input
                type="file"
                accept="image/*"
                onChange={onPickImage}
                disabled={loadingImage}
                className="sr-only"
              />
            </label>
            {imagePath && !loadingImage && (
              <button
                type="button"
                onClick={() => setImagePath(null)}
                className="cursor-pointer text-xs text-muted transition-colors hover:text-danger"
              >
                Hapus foto
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={onDone} className="flex-1">
          Batal
        </Button>
        <Button type="submit" variant="primary" className="flex-1">
          Simpan
        </Button>
      </div>
    </form>
  );
}
