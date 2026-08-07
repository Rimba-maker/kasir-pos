import { cartTotals, useCartStore } from "@/entities/transaction";
import { formatRupiah } from "@/shared/lib/currency";
import { lineTotal } from "@/entities/transaction";

interface CartPanelProps {
  /** Called when the cashier taps "Bayar". Payment flow wires this in later steps. */
  onCheckout?: () => void;
}

/** Cart: line items with qty controls, transaction discount, tax, live totals. */
export function CartPanel({ onCheckout }: CartPanelProps) {
  const lines = useCartStore((s) => s.lines);
  const discountTotal = useCartStore((s) => s.discountTotal);
  const taxRate = useCartStore((s) => s.taxRate);
  const changeQty = useCartStore((s) => s.changeQty);
  const removeLine = useCartStore((s) => s.removeLine);
  const setDiscountTotal = useCartStore((s) => s.setDiscountTotal);
  const clear = useCartStore((s) => s.clear);

  const totals = cartTotals({ lines, discountTotal, taxRate });
  const empty = lines.length === 0;

  return (
    <div className="flex h-full flex-col rounded-lg border border-neutral-200 bg-white">
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
        <h2 className="font-semibold">Keranjang</h2>
        {!empty && (
          <button
            type="button"
            onClick={clear}
            className="text-sm text-neutral-500 hover:text-red-600"
          >
            Kosongkan
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {empty ? (
          <div className="flex h-full items-center justify-center p-6 text-sm text-neutral-400">
            Keranjang kosong.
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {lines.map((l) => (
              <li key={l.productId} className="flex items-center gap-2 px-4 py-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{l.name}</p>
                  <p className="text-xs text-neutral-500">{formatRupiah(l.unitPrice)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => changeQty(l.productId, -1)}
                    className="h-7 w-7 rounded border border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm tabular-nums">{l.qty}</span>
                  <button
                    type="button"
                    onClick={() => changeQty(l.productId, 1)}
                    className="h-7 w-7 rounded border border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                  >
                    +
                  </button>
                </div>
                <div className="w-20 text-right text-sm font-medium tabular-nums">
                  {formatRupiah(lineTotal(l))}
                </div>
                <button
                  type="button"
                  onClick={() => removeLine(l.productId)}
                  className="text-neutral-400 hover:text-red-600"
                  aria-label="Hapus"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-2 border-t border-neutral-200 px-4 py-3 text-sm">
        <Row label="Subtotal" value={formatRupiah(totals.subtotal)} />
        <div className="flex items-center justify-between">
          <span className="text-neutral-600">Diskon transaksi</span>
          <input
            type="number"
            min={0}
            value={discountTotal || ""}
            onChange={(e) => setDiscountTotal(Number(e.target.value) || 0)}
            placeholder="0"
            className="w-28 rounded border border-neutral-300 px-2 py-1 text-right tabular-nums outline-none focus:border-neutral-500"
          />
        </div>
        {taxRate > 0 && (
          <Row label={`Pajak (${Math.round(taxRate * 100)}%)`} value={formatRupiah(totals.taxTotal)} />
        )}
        <div className="flex items-center justify-between border-t border-neutral-200 pt-2 text-base font-semibold">
          <span>Total</span>
          <span className="tabular-nums">{formatRupiah(totals.total)}</span>
        </div>
        <button
          type="button"
          disabled={empty}
          onClick={onCheckout}
          className="mt-1 w-full rounded-md bg-neutral-900 py-2.5 font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Bayar
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-neutral-600">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
