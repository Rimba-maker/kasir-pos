import { ImageIcon } from "lucide-react";
import type { Product } from "../model/types";
import { sellPrice } from "../model/pricing";
import { kitStock } from "../model/kit";
import { useCatalogStore } from "../model/store";
import { formatRupiah } from "@/shared/lib/currency";
import { StockBadge } from "./StockBadge";

interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
}

/** Product tile: photo, name, price, stock. Disabled when out of stock. */
export function ProductCard({ product, onSelect }: ProductCardProps) {
  const products = useCatalogStore((s) => s.products);
  const stock = product.isKit ? kitStock(product, products) : product.stock;
  const soldOut = stock <= 0;

  return (
    <button
      type="button"
      disabled={soldOut}
      onClick={() => onSelect?.(product)}
      className="group flex cursor-pointer flex-col rounded-xl border border-border bg-surface text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 disabled:hover:shadow-none"
    >
      <div className="aspect-square w-full overflow-hidden rounded-t-xl bg-surface-2">
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
        <span className="text-sm font-semibold text-primary">{formatRupiah(sellPrice(product))}</span>
        <div className="mt-auto pt-1">
          <StockBadge stock={stock} />
        </div>
      </div>
    </button>
  );
}
