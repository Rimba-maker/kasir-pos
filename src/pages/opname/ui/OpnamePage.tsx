import { useState } from "react";
import { ClipboardCheck, PackageOpen } from "lucide-react";
import { useCatalogStore } from "@/entities/product";
import { postOpname } from "@/entities/opname";
import { Button } from "@/shared/ui/Button";

export function OpnamePage() {
  const products = useCatalogStore((s) => s.products);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const countFor = (id: string, sysStock: number) => counts[id] ?? sysStock;

  function submit() {
    const lines = products.map((p) => ({ productId: p.id, countedQty: countFor(p.id, p.stock) }));
    postOpname(lines);
    setCounts({});
    setSavedAt(Date.now());
  }

  const changed = products.some((p) => counts[p.id] !== undefined && counts[p.id] !== p.stock);

  return (
    <div className="h-full overflow-auto p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-fg">Stok Opname</h1>
          <p className="text-sm text-muted">Isi hitungan fisik; hanya yang berbeda yang disesuaikan.</p>
        </div>
        <Button variant="primary" size="sm" onClick={submit} disabled={!changed}>
          <ClipboardCheck className="h-4 w-4" />
          Simpan opname
        </Button>
      </div>

      {savedAt && (
        <p className="mb-3 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
          Opname tersimpan — stok disesuaikan dengan hitungan fisik.
        </p>
      )}

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-16 text-muted">
          <PackageOpen className="h-10 w-10" strokeWidth={1.5} />
          <p className="text-sm">Belum ada produk.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[480px] text-sm">
            <thead className="bg-surface-2 text-left text-muted">
              <tr>
                <th className="px-3 py-2.5 font-medium">Produk</th>
                <th className="px-3 py-2.5 text-right font-medium">Sistem</th>
                <th className="px-3 py-2.5 text-right font-medium">Hitungan</th>
                <th className="px-3 py-2.5 text-right font-medium">Selisih</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const c = countFor(p.id, p.stock);
                const diff = c - p.stock;
                return (
                  <tr key={p.id} className="border-t border-border">
                    <td className="px-3 py-2.5 font-medium text-fg">{p.name}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-muted">{p.stock}</td>
                    <td className="px-3 py-2.5 text-right">
                      <input
                        type="number"
                        min={0}
                        value={counts[p.id] ?? p.stock}
                        onChange={(e) => setCounts((q) => ({ ...q, [p.id]: Number(e.target.value) || 0 }))}
                        className="w-20 rounded-lg border border-border bg-surface px-2 py-1 text-right text-sm text-fg outline-none focus:border-primary"
                      />
                    </td>
                    <td
                      className={`px-3 py-2.5 text-right tabular-nums ${
                        diff === 0 ? "text-muted" : diff > 0 ? "text-success" : "text-danger"
                      }`}
                    >
                      {diff > 0 ? `+${diff}` : diff}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
