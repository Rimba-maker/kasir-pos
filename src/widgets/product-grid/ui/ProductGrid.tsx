import { useState } from "react";
import { ImageIcon, Layers, PackageOpen, X } from "lucide-react";
import {
  groupProducts,
  ProductCard,
  sellPrice,
  StockBadge,
  useCatalogStore,
  variantLabel,
  type Product,
} from "@/entities/product";
import { addProductToCart } from "@/features/add-to-cart";
import { formatRupiah } from "@/shared/lib/currency";
import { CategoryFilter } from "./CategoryFilter";

/** Product tiles with category chip filter. Tapping a tile (or a variant) adds to cart. */
export function ProductGrid() {
  const products = useCatalogStore((s) => s.products);
  const categories = useCatalogStore((s) => s.categories);
  const [catId, setCatId] = useState<string | null>(null);
  const [picking, setPicking] = useState<{ group: string; members: Product[] } | null>(null);

  const shown = catId ? products.filter((p) => p.categoryId === catId) : products;
  const entries = groupProducts(shown);

  return (
    <div className="flex h-full flex-col gap-3">
      <CategoryFilter categories={categories} selected={catId} onSelect={setCatId} />
      {entries.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted">
          <PackageOpen className="h-10 w-10" strokeWidth={1.5} />
          <p className="text-sm">Belum ada produk.</p>
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-2 content-start gap-3 overflow-y-auto pr-1 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
          {entries.map((e) =>
            e.kind === "single" ? (
              <ProductCard key={e.product.id} product={e.product} onSelect={addProductToCart} />
            ) : (
              <GroupTile key={e.group} group={e.group} members={e.members} onOpen={() => setPicking(e)} />
            ),
          )}
        </div>
      )}

      {picking && (
        <VariantPicker group={picking.group} members={picking.members} onClose={() => setPicking(null)} />
      )}
    </div>
  );
}

function GroupTile({ group, members, onOpen }: { group: string; members: Product[]; onOpen: () => void }) {
  const prices = members.map((m) => sellPrice(m));
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const cover = members.find((m) => m.imagePath)?.imagePath ?? null;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex cursor-pointer flex-col rounded-xl border border-border bg-surface text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-t-xl bg-surface-2">
        {cover ? (
          <img src={cover} alt={group} className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted/40">
            <ImageIcon className="h-8 w-8" strokeWidth={1.5} />
          </div>
        )}
        <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-md bg-primary/90 px-1.5 py-0.5 text-[11px] font-medium text-on-primary">
          <Layers className="h-3 w-3" /> {members.length} varian
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <span className="line-clamp-2 text-sm font-medium text-fg">{group}</span>
        <span className="text-sm font-semibold text-primary">
          {min === max ? formatRupiah(min) : `${formatRupiah(min)}–${formatRupiah(max)}`}
        </span>
      </div>
    </button>
  );
}

function VariantPicker({ group, members, onClose }: { group: string; members: Product[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div
        className="max-h-[80vh] w-full overflow-y-auto rounded-t-2xl border border-border bg-surface p-4 sm:max-w-md sm:rounded-2xl"
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-fg">{group}</h2>
          <button type="button" onClick={onClose} aria-label="Tutup" className="cursor-pointer text-muted hover:text-fg">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-2">
          {members.map((m) => {
            const soldOut = m.stock <= 0;
            return (
              <button
                key={m.id}
                type="button"
                disabled={soldOut}
                onClick={() => addProductToCart(m)}
                className="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2.5 text-left transition-colors hover:border-primary hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-fg">{m.variantName?.trim() || variantLabel(m)}</p>
                  <p className="text-xs font-semibold text-primary">{formatRupiah(sellPrice(m))}</p>
                </div>
                <StockBadge stock={m.stock} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
