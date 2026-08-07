import type { Product } from "@/entities/product";
import { useCatalogStore } from "@/entities/product";
import { productApi, isTauri } from "@/shared/api/pos";

/** Upsert a product: update the store immediately, persist to DB when in Tauri. */
export async function saveProduct(product: Product): Promise<void> {
  useCatalogStore.getState().upsertProduct(product);
  if (isTauri()) await productApi.save(product);
}

export async function deleteProduct(id: string): Promise<void> {
  useCatalogStore.getState().removeProduct(id);
  if (isTauri()) await productApi.remove(id);
}

export async function deleteProducts(ids: string[]): Promise<void> {
  useCatalogStore.getState().removeProducts(ids);
  if (isTauri()) await Promise.all(ids.map((id) => productApi.remove(id)));
}
