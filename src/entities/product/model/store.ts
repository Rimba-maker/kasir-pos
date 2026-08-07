import { create } from "zustand";
import type { Category, Product } from "./types";

interface CatalogState {
  products: Product[];
  categories: Category[];
  setProducts: (products: Product[]) => void;
  setCategories: (categories: Category[]) => void;
  upsertProduct: (product: Product) => void;
  removeProduct: (id: string) => void;
  /** Local stock decrement after a confirmed sale. Backend remains source of truth. */
  decrementStock: (id: string, qty: number) => void;
}

export const useCatalogStore = create<CatalogState>((set) => ({
  products: [],
  categories: [],
  setProducts: (products) => set({ products }),
  setCategories: (categories) => set({ categories }),
  upsertProduct: (product) =>
    set((s) => {
      const i = s.products.findIndex((p) => p.id === product.id);
      if (i === -1) return { products: [...s.products, product] };
      const next = s.products.slice();
      next[i] = product;
      return { products: next };
    }),
  removeProduct: (id) => set((s) => ({ products: s.products.filter((p) => p.id !== id) })),
  decrementStock: (id, qty) =>
    set((s) => ({
      products: s.products.map((p) =>
        p.id === id ? { ...p, stock: Math.max(0, p.stock - qty) } : p,
      ),
    })),
}));
