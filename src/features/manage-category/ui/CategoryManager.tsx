import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useCatalogStore } from "@/entities/product";
import { Button } from "@/shared/ui/Button";
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
          className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg outline-none focus:border-primary"
        />
        <Button type="submit" variant="primary">
          Tambah
        </Button>
      </form>
      {categories.length === 0 ? (
        <p className="text-sm text-muted">Belum ada kategori.</p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {categories.map((c) => (
            <li key={c.id} className="flex items-center justify-between px-3 py-2 text-sm text-fg">
              <span>{c.name}</span>
              <button
                type="button"
                onClick={() => deleteCategory(c.id)}
                className="flex cursor-pointer items-center gap-1 text-muted transition-colors hover:text-danger"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Hapus
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
