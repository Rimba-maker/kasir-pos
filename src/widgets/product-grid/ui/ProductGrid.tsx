import { useState } from "react";
import { ProductCard, useCatalogStore } from "@/entities/product";
import { addProductToCart } from "@/features/add-to-cart";
import { CategoryFilter } from "./CategoryFilter";

/** Product tiles with category chip filter. Tapping a tile adds to cart. */
export function ProductGrid() {
  const products = useCatalogStore((s) => s.products);
  const categories = useCatalogStore((s) => s.categories);
  const [catId, setCatId] = useState<string | null>(null);

  const shown = catId ? products.filter((p) => p.categoryId === catId) : products;

  return (
    <div className="flex h-full flex-col gap-3">
      <CategoryFilter categories={categories} selected={catId} onSelect={setCatId} />
      {shown.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-sm text-neutral-400">
          Belum ada produk.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((p) => (
            <ProductCard key={p.id} product={p} onSelect={addProductToCart} />
          ))}
        </div>
      )}
    </div>
  );
}
