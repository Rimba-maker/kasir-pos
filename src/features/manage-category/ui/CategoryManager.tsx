import { useState } from "react";
import { useCatalogStore } from "@/entities/product";
import { deleteCategory, saveCategory } from "../model/manage-category";

/** Inline add/remove list for categories. */
export function CategoryManager() {
  const categories = useCatalogStore((s) => s.categories);
  const [name, setName] = useState("");

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await saveCategory(name);
    setName("");
  }

  return (
    <div className="space-y-3">
      <form onSubmit={add} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Kategori baru"
          className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
        />
        <button
          type="submit"
          className="rounded-md bg-neutral-900 px-4 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Tambah
        </button>
      </form>
      {categories.length === 0 ? (
        <p className="text-sm text-neutral-400">Belum ada kategori.</p>
      ) : (
        <ul className="divide-y divide-neutral-100 rounded-md border border-neutral-200">
          {categories.map((c) => (
            <li key={c.id} className="flex items-center justify-between px-3 py-2 text-sm">
              <span>{c.name}</span>
              <button
                type="button"
                onClick={() => deleteCategory(c.id)}
                className="text-neutral-400 hover:text-red-600"
              >
                Hapus
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
