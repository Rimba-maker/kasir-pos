import { useState } from "react";
import { PackageCheck, ShoppingBag } from "lucide-react";
import { useCatalogStore } from "@/entities/product";
import { useSupplierStore } from "@/entities/supplier";
import { usePurchaseStore } from "@/entities/purchase";
import { buildReorderDrafts, lowStockProducts } from "@/features/reorder";
import { Button } from "@/shared/ui/Button";

export function ReorderPage() {
  const products = useCatalogStore((s) => s.products);
  const suppliers = useSupplierStore((s) => s.suppliers);
  const upsertOrder = usePurchaseStore((s) => s.upsertOrder);
  const [made, setMade] = useState<number | null>(null);

  const low = lowStockProducts(products);
  const canDraft = low.some((p) => p.defaultSupplierId);
  const supplierName = (id: string | null | undefined) =>
    (id && suppliers.find((s) => s.id === id)?.name) || "—";

  function generate() {
    const drafts = buildReorderDrafts(products);
    for (const d of drafts) {
      upsertOrder({
        id: crypto.randomUUID(),
        supplierId: d.supplierId,
        status: "draft",
        createdAt: new Date().toISOString(),
        dueDate: null,
        lines: d.lines,
      });
    }
    setMade(drafts.length);
  }

  return (
    <div className="h-full overflow-auto p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-fg">Stok Menipis</h1>
          <p className="text-sm text-muted">Produk di bawah stok minimum + saran pembuatan draft PO.</p>
        </div>
        <Button variant="primary" size="sm" onClick={generate} disabled={!canDraft}>
          <ShoppingBag className="h-4 w-4" />
          Buat draft PO
        </Button>
      </div>

      {made !== null && (
        <p className="mb-3 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
          {made > 0
            ? `${made} draft PO dibuat — buka menu Pembelian untuk meninjau & memesan.`
            : "Tidak ada produk menipis yang punya supplier utama."}
        </p>
      )}

      {low.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-16 text-muted">
          <PackageCheck className="h-10 w-10" strokeWidth={1.5} />
          <p className="text-sm">Semua stok aman.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="bg-surface-2 text-left text-muted">
              <tr>
                <th className="px-3 py-2.5 font-medium">Produk</th>
                <th className="px-3 py-2.5 text-right font-medium">Stok</th>
                <th className="px-3 py-2.5 text-right font-medium">Minimum</th>
                <th className="px-3 py-2.5 text-right font-medium">Pesan</th>
                <th className="px-3 py-2.5 font-medium">Supplier</th>
              </tr>
            </thead>
            <tbody>
              {low.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-3 py-2.5 font-medium text-fg">{p.name}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-danger">{p.stock}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-muted">{p.reorderPoint}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-fg">{p.reorderQty ?? "—"}</td>
                  <td className="px-3 py-2.5 text-muted">{supplierName(p.defaultSupplierId)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
