import type { Category } from "@/entities/product";
import { useCatalogStore } from "@/entities/product";
import { categoryApi, isTauri } from "@/shared/api/pos";

export async function saveCategory(name: string, id?: string): Promise<void> {
  const category: Category = { id: id ?? crypto.randomUUID(), name: name.trim() };
  if (!category.name) return;
  useCatalogStore.getState().upsertCategory(category);
  if (isTauri()) await categoryApi.save(category);
}

export async function deleteCategory(id: string): Promise<void> {
  useCatalogStore.getState().removeCategory(id);
  if (isTauri()) await categoryApi.remove(id);
}
