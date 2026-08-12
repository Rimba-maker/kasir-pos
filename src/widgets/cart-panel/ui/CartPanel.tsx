import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { cartTotals, lineTotal, useCartStore } from "@/entities/transaction";
import { formatRupiah } from "@/shared/lib/currency";
import { Button } from "@/shared/ui/Button";
import { CustomerSelect } from "@/features/quick-add-customer";

interface CartPanelProps {
  /** Called when the cashier taps "Bayar". Payment flow wires this in later steps. */
  onCheckout?: () => void;
}

/** Cart: line items with qty controls, transaction discount, tax, live totals. */
export function CartPanel({ onCheckout }: CartPanelProps) {
  const lines = useCartStore((s) => s.lines);
  const discountTotal = useCartStore((s) => s.discountTotal);
  const taxRate = useCartStore((s) => s.taxRate);
  const taxInclusive = useCartStore((s) => s.taxInclusive);
  const changeQty = useCartStore((s) => s.changeQty);
  const removeLine = useCartStore((s) => s.removeLine);
  const setDiscountTotal = useCartStore((s) => s.setDiscountTotal);
  const clear = useCartStore((s) => s.clear);

  const totals = cartTotals({ lines, discountTotal, taxRate, taxInclusive });
  const empty = lines.length === 0;
  const itemCount = lines.reduce((n, l) => n + l.qty, 0);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="flex items-center gap-2 font-semibold text-fg">
          <ShoppingCart className="h-4 w-4 text-primary" />
          Keranjang
          {itemCount > 0 && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {itemCount}
            </span>
          )}
        </h2>
        {!empty && (
          <button
            type="button"
            onClick={clear}
            className="cursor-pointer text-sm text-muted transition-colors hover:text-danger"
          >
            Kosongkan
          </button>
        )}
      </div>

      <div className="border-b border-border px-4 py-2.5">
        <CustomerSelect />
      </div>

      <div className="flex-1 overflow-y-auto">
        {empty ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-muted">
            <ShoppingCart className="h-9 w-9" strokeWidth={1.5} />
            <p className="text-sm">Keranjang kosong.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {lines.map((l) => (
              <li key={l.productId} className="flex items-center gap-2 px-4 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-fg">{l.name}</p>
                  <p className="text-xs text-muted">{formatRupiah(l.unitPrice)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => changeQty(l.productId, -1)}
                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-border text-fg transition-colors hover:bg-surface-2"
                    aria-label="Kurangi"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-medium tabular-nums">{l.qty}</span>
                  <button
                    type="button"
                    onClick={() => changeQty(l.productId, 1)}
                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-border text-fg transition-colors hover:bg-surface-2"
                    aria-label="Tambah"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="w-20 text-right text-sm font-semibold tabular-nums">
                  {formatRupiah(lineTotal(l))}
                </div>
                <button
                  type="button"
                  onClick={() => removeLine(l.productId)}
                  className="cursor-pointer text-muted transition-colors hover:text-danger"
                  aria-label={`Hapus ${l.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-2 border-t border-border bg-surface-2/50 px-4 py-3 text-sm">
        <Row label="Subtotal" value={formatRupiah(totals.subtotal)} />
        <div className="flex items-center justify-between">
          <span className="text-muted">Diskon transaksi</span>
          <input
            type="number"
            min={0}
            value={discountTotal || ""}
            onChange={(e) => setDiscountTotal(Number(e.target.value) || 0)}
            placeholder="0"
            className="w-28 rounded-md border border-border bg-surface px-2 py-1 text-right tabular-nums text-fg outline-none focus:border-primary"
          />
        </div>
        {taxRate > 0 && (
          <Row label={`Pajak (${Math.round(taxRate * 100)}%)`} value={formatRupiah(totals.taxTotal)} />
        )}
        <div className="flex items-center justify-between border-t border-border pt-2 text-base font-bold text-fg">
          <span>Total</span>
          <span className="tabular-nums">{formatRupiah(totals.total)}</span>
        </div>
        <Button variant="accent" size="lg" disabled={empty} onClick={onCheckout} className="mt-1 w-full">
          Bayar
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className="tabular-nums text-fg">{value}</span>
    </div>
  );
}
