import { ImageIcon } from "lucide-react";
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
      className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-surface text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 disabled:hover:shadow-none"
    >
      <div className="aspect-square w-full bg-surface-2">
        {product.imagePath ? (
          <img
            src={product.imagePath}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted/40">
            <ImageIcon className="h-8 w-8" strokeWidth={1.5} />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <span className="line-clamp-2 text-sm font-medium text-fg">{product.name}</span>
        <span className="text-sm font-semibold text-primary">{formatRupiah(product.price)}</span>
        <div className="mt-auto pt-1">
          <StockBadge stock={product.stock} />
        </div>
      </div>
    </button>
  );
}
