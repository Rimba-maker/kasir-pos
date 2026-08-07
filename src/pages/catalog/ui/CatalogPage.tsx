import { useState } from "react";
import { StockBadge, useCatalogStore, type Product } from "@/entities/product";
import { ProductForm, deleteProduct, deleteProducts } from "@/features/manage-product";
import { CategoryManager } from "@/features/manage-category";
import { formatRupiah } from "@/shared/lib/currency";
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
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">Katalog Produk</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowCategories(true)}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-100"
          >
            Kelola Kategori
          </button>
          {selected.size > 0 && (
            <button
              type="button"
              onClick={bulkDelete}
              className="rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
            >
              Hapus {selected.size} terpilih
            </button>
          )}
          <button
            type="button"
            onClick={() => setEditing(null)}
            className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800"
          >
            + Produk
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-neutral-50 text-left text-neutral-500">
            <tr>
              <th className="w-10 px-3 py-2"></th>
              <th className="px-3 py-2">Nama</th>
              <th className="px-3 py-2">Kategori</th>
              <th className="px-3 py-2 text-right">Harga</th>
              <th className="px-3 py-2">Stok</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-neutral-400">
                  Belum ada produk.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50">
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => toggle(p.id)}
                    />
                  </td>
                  <td className="px-3 py-2 font-medium">{p.name}</td>
                  <td className="px-3 py-2 text-neutral-600">{categoryName(p.categoryId)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatRupiah(p.price)}</td>
                  <td className="px-3 py-2">
                    <StockBadge stock={p.stock} />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => setEditing(p)}
                      className="text-neutral-500 hover:text-neutral-900"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteProduct(p.id)}
                      className="ml-3 text-neutral-400 hover:text-red-600"
                    >
                      Hapus
                    </button>
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
          <ProductForm
            product={editing}
            categories={categories}
            onDone={() => setEditing(undefined)}
          />
        )}
      </Modal>

      <Modal open={showCategories} title="Kelola Kategori" onClose={() => setShowCategories(false)}>
        <CategoryManager />
      </Modal>
    </div>
  );
}
