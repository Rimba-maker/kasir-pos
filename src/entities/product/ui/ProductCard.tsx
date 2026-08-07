import type { Product } from "../model/types";
import { formatRupiah } from "@/shared/lib/currency";
import { StockBadge } from "./StockBadge";

interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
}

/** Product tile: photo, name, price, stock. Disabled when out of stock. */
export function ProductCard({ product, onSelect }: ProductCardProps) {
  const soldOut = product.stock <= 0;

  return (
    <button
      type="button"
      disabled={soldOut}
      onClick={() => onSelect?.(product)}
      className="flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white text-left transition hover:border-neutral-300 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
    >
      <div className="aspect-square w-full bg-neutral-100">
        {product.imagePath ? (
          <img
            src={product.imagePath}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-300">
            <span className="text-3xl">🛒</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-2">
        <span className="line-clamp-2 text-sm font-medium text-neutral-900">{product.name}</span>
        <span className="text-sm font-semibold text-neutral-700">
          {formatRupiah(product.price)}
        </span>
        <div className="mt-auto pt-1">
          <StockBadge stock={product.stock} />
        </div>
      </div>
    </button>
  );
}
