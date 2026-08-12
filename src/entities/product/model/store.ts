import { create } from "zustand";
import type { Category, Product } from "./types";

interface CatalogState {
  products: Product[];
  categories: Category[];
  setProducts: (products: Product[]) => void;
  setCategories: (categories: Category[]) => void;
  upsertProduct: (product: Product) => void;
  removeProduct: (id: string) => void;
  removeProducts: (ids: string[]) => void;
  upsertCategory: (category: Category) => void;
  removeCategory: (id: string) => void;
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
  removeProducts: (ids) =>
    set((s) => {
      const drop = new Set(ids);
      return { products: s.products.filter((p) => !drop.has(p.id)) };
    }),
  upsertCategory: (category) =>
    set((s) => {
      const i = s.categories.findIndex((c) => c.id === category.id);
      if (i === -1) return { categories: [...s.categories, category] };
      const next = s.categories.slice();
      next[i] = category;
      return { categories: next };
    }),
  removeCategory: (id) =>
    set((s) => ({
      categories: s.categories.filter((c) => c.id !== id),
      // orphaned products fall back to "uncategorized"
      products: s.products.map((p) => (p.categoryId === id ? { ...p, categoryId: null } : p)),
    })),
}));
