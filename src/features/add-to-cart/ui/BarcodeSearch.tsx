import { useState } from "react";
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
    <form onSubmit={submit}>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Scan barcode / cari produk, tekan Enter"
        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
        autoFocus
      />
    </form>
  );
}
