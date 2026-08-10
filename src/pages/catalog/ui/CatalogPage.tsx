import { useState } from "react";
import { Pencil, Plus, Tags, Trash2 } from "lucide-react";
import { StockBadge, useCatalogStore, type Product } from "@/entities/product";
import { ProductForm, deleteProduct, deleteProducts } from "@/features/manage-product";
import { CategoryManager } from "@/features/manage-category";
import { formatRupiah } from "@/shared/lib/currency";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";

export function CatalogPage() {
  const products = useCatalogStore((s) => s.products);
  const categories = useCatalogStore((s) => s.categories);
  const [editing, setEditing] = useState<Product | null | undefined>(undefined); // undefined = closed
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showCategories, setShowCategories] = useState(false);

  const categoryName = (id: string | null) =>
    id ? (categories.find((c) => c.id === id)?.name ?? "—") : "—";

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function bulkDelete() {
    if (selected.size === 0) return;
    await deleteProducts([...selected]);
    setSelected(new Set());
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-fg">Katalog Produk</h1>
          <p className="text-sm text-muted">{products.length} produk</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowCategories(true)}>
            <Tags className="h-4 w-4" />
            Kategori
          </Button>
          {selected.size > 0 && (
            <Button variant="danger" size="sm" onClick={bulkDelete}>
              <Trash2 className="h-4 w-4" />
              Hapus {selected.size}
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={() => setEditing(null)}>
            <Plus className="h-4 w-4" />
            Produk
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-border bg-surface">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="sticky top-0 bg-surface-2 text-left text-muted">
            <tr>
              <th className="w-10 px-3 py-2.5"></th>
              <th className="px-3 py-2.5 font-medium">Nama</th>
              <th className="px-3 py-2.5 font-medium">Kategori</th>
              <th className="px-3 py-2.5 text-right font-medium">Harga</th>
              <th className="px-3 py-2.5 font-medium">Stok</th>
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-10 text-center text-muted">
                  Belum ada produk.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-surface-2/60">
                  <td className="px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => toggle(p.id)}
                      className="accent-[var(--color-primary)]"
                      aria-label={`Pilih ${p.name}`}
                    />
                  </td>
                  <td className="px-3 py-2.5 font-medium text-fg">{p.name}</td>
                  <td className="px-3 py-2.5 text-muted">{categoryName(p.categoryId)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-fg">{formatRupiah(p.price)}</td>
                  <td className="px-3 py-2.5">
                    <StockBadge stock={p.stock} />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setEditing(p)}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-fg"
                        aria-label={`Edit ${p.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteProduct(p.id)}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger-bg hover:text-danger"
                        aria-label={`Hapus ${p.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={editing !== undefined}
        title={editing ? "Edit Produk" : "Produk Baru"}
        onClose={() => setEditing(undefined)}
      >
        {editing !== undefined && (
          <ProductForm product={editing} categories={categories} onDone={() => setEditing(undefined)} />
        )}
      </Modal>

      <Modal open={showCategories} title="Kelola Kategori" onClose={() => setShowCategories(false)}>
        <CategoryManager />
      </Modal>
    </div>
  );
}
