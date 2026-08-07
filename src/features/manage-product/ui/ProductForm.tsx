import { useState } from "react";
import type { Category, Product } from "@/entities/product";
import { fileToDataUrl } from "@/shared/lib/image";
import { saveProduct } from "../model/manage-product";

interface ProductFormProps {
  /** Existing product to edit, or null to create. */
  product: Product | null;
  categories: Category[];
  onDone: () => void;
}

export function ProductForm({ product, categories, onDone }: ProductFormProps) {
  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(product?.price ?? 0);
  const [stock, setStock] = useState(product?.stock ?? 0);
  const [categoryId, setCategoryId] = useState<string | null>(product?.categoryId ?? null);
  const [barcode, setBarcode] = useState(product?.barcode ?? "");
  const [imagePath, setImagePath] = useState<string | null>(product?.imagePath ?? null);

  async function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setImagePath(await fileToDataUrl(file));
    } catch (err) {
      alert(`Gagal memuat gambar: ${String(err)}`);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await saveProduct({
      id: product?.id ?? crypto.randomUUID(),
      name: name.trim(),
      price: Math.max(0, Math.round(price)),
      stock: Math.max(0, Math.round(stock)),
      categoryId,
      barcode: barcode.trim() || null,
      imagePath,
    });
    onDone();
  }

  const field = "mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500";

  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block text-sm">
        <span className="text-neutral-600">Nama produk</span>
        <input value={name} onChange={(e) => setName(e.target.value)} className={field} autoFocus />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm">
          <span className="text-neutral-600">Harga</span>
          <input
            type="number"
            min={0}
            value={price || ""}
            onChange={(e) => setPrice(Number(e.target.value) || 0)}
            className={field}
          />
        </label>
        <label className="block text-sm">
          <span className="text-neutral-600">Stok</span>
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
        <span className="text-neutral-600">Kategori</span>
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
        <span className="text-neutral-600">Barcode (opsional)</span>
        <input value={barcode} onChange={(e) => setBarcode(e.target.value)} className={field} />
      </label>

      <div className="text-sm">
        <span className="text-neutral-600">Foto produk</span>
        <div className="mt-1 flex items-center gap-3">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-neutral-200 bg-neutral-100">
            {imagePath ? (
              <img src={imagePath} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-neutral-300">🛒</div>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <input type="file" accept="image/*" onChange={onPickImage} className="text-xs" />
            {imagePath && (
              <button
                type="button"
                onClick={() => setImagePath(null)}
                className="self-start text-xs text-neutral-500 hover:text-red-600"
              >
                Hapus foto
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onDone}
          className="flex-1 rounded-md border border-neutral-300 py-2 font-medium hover:bg-neutral-100"
        >
          Batal
        </button>
        <button
          type="submit"
          className="flex-1 rounded-md bg-neutral-900 py-2 font-medium text-white hover:bg-neutral-800"
        >
          Simpan
        </button>
      </div>
    </form>
  );
}
