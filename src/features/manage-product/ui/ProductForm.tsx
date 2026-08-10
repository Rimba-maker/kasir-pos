import { useState } from "react";
import { ImageIcon, Loader2, Upload } from "lucide-react";
import type { Category, Product } from "@/entities/product";
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
  const [price, setPrice] = useState(product?.price ?? 0);
  const [stock, setStock] = useState(product?.stock ?? 0);
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
          <span className="text-muted">Harga</span>
          <input
            type="number"
            min={0}
            value={price || ""}
            onChange={(e) => setPrice(Number(e.target.value) || 0)}
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
