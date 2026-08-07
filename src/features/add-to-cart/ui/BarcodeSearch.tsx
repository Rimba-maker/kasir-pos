import { useState } from "react";
import { Search } from "lucide-react";
import { useCatalogStore } from "@/entities/product";
import { addProductToCart } from "../model/add-to-cart";

/** Barcode/name box: Enter matches a product and adds it to the cart. */
export function BarcodeSearch() {
  const [q, setQ] = useState("");
  const products = useCatalogStore((s) => s.products);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim().toLowerCase();
    if (!query) return;
    const match =
      products.find((p) => p.barcode?.toLowerCase() === query) ??
      products.find((p) => p.name.toLowerCase().includes(query));
    if (match) {
      addProductToCart(match);
      setQ("");
    }
  }

  return (
    <form onSubmit={submit} className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Scan barcode / cari produk, tekan Enter"
        className="w-full rounded-lg border border-border bg-surface py-2.5 pl-9 pr-3 text-sm text-fg outline-none transition-colors placeholder:text-muted focus:border-primary"
        autoFocus
      />
    </form>
  );
}
