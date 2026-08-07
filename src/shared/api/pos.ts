import { invoke } from "@tauri-apps/api/core";
import type { Category, Product } from "@/entities/product";
import type { Transaction } from "@/entities/transaction";

/** Typed wrappers over Tauri commands. Only callable inside the Tauri runtime. */
export const productApi = {
  list: () => invoke<Product[]>("list_products"),
  get: (id: string) => invoke<Product | null>("get_product", { id }),
  save: (product: Product) => invoke<void>("save_product", { product }),
  remove: (id: string) => invoke<void>("delete_product", { id }),
};

export const categoryApi = {
  list: () => invoke<Category[]>("list_categories"),
  save: (category: Category) => invoke<void>("save_category", { category }),
  remove: (id: string) => invoke<void>("delete_category", { id }),
};

export const transactionApi = {
  create: (tx: Transaction) => invoke<void>("create_transaction", { tx }),
  list: () => invoke<Transaction[]>("list_transactions"),
  get: (id: string) => invoke<Transaction | null>("get_transaction", { id }),
  remove: (id: string) => invoke<void>("delete_transaction", { id }),
};

/** True when running inside the Tauri desktop shell (vs. plain browser dev). */
export function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}
