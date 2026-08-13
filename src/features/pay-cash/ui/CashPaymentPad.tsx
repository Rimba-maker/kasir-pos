import { useState } from "react";
import { calcChange, type Payment } from "@/entities/transaction";
import { IDR_DENOMINATIONS } from "@/shared/config";
import { formatRupiah, formatRupiahShort } from "@/shared/lib/currency";
import { Button } from "@/shared/ui/Button";

interface CashPaymentPadProps {
  total: number;
  onConfirm: (payment: Payment) => void;
  onCancel?: () => void;
}

/**
 * Cash pad: tap denominations to BUILD UP the tender (additive — 100rb ×2 = 200rb),
 * plus manual entry, Uang Pas, and Reset. Computes change; confirm when paid >= total.
 */
export function CashPaymentPad({ total, onConfirm, onCancel }: CashPaymentPadProps) {
  const [paid, setPaid] = useState(0);
  const change = calcChange(total, paid);
  const enough = paid >= total;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2.5 text-sm">
        <span className="text-muted">Total tagihan</span>
        <span className="text-lg font-bold tabular-nums text-fg">{formatRupiah(total)}</span>
      </div>

      {/* Running tender — reflects tapped denominations, still hand-editable */}
      <label className="block text-sm">
        <span className="text-muted">Uang diterima</span>
        <div className="mt-1 flex items-stretch gap-2">
          <input
            type="number"
            min={0}
            value={paid || ""}
            onChange={(e) => setPaid(Number(e.target.value) || 0)}
            placeholder="0"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-right text-lg font-semibold tabular-nums text-fg outline-none focus:border-primary"
            autoFocus
          />
          <button
            type="button"
            onClick={() => setPaid(0)}
            disabled={paid === 0}
            className="shrink-0 cursor-pointer rounded-lg border border-border px-3 text-sm font-medium text-muted transition-colors hover:border-danger hover:text-danger disabled:cursor-default disabled:opacity-40"
          >
            Reset
          </button>
        </div>
      </label>

      {/* Denomination chips — each tap ADDS that note/coin to the tender */}
      <div className="grid grid-cols-4 gap-2">
        {IDR_DENOMINATIONS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setPaid((p) => p + n)}
            className="min-h-[44px] cursor-pointer rounded-lg border border-border py-2.5 text-sm font-medium text-fg transition-colors hover:border-primary hover:bg-surface-2"
          >
            {formatRupiahShort(n)}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setPaid(total)}
          className="col-span-2 min-h-[44px] cursor-pointer rounded-lg border border-primary py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-surface-2"
        >
          Uang Pas
        </button>
      </div>

      <div className="flex items-center justify-between rounded-lg bg-success-bg px-3 py-2.5 text-sm">
        <span className="text-success-fg">Kembalian</span>
        <span className="text-lg font-bold tabular-nums text-success-fg">{formatRupiah(change)}</span>
      </div>

      <div className="flex gap-2">
        {onCancel && (
          <Button variant="outline" size="lg" onClick={onCancel} className="flex-1">
            Batal
          </Button>
        )}
        <Button
          variant="accent"
          size="lg"
          disabled={!enough}
          onClick={() => onConfirm({ method: "cash", amountPaid: paid, change })}
          className="flex-1"
        >
          Konfirmasi
        </Button>
      </div>
    </div>
  );
}
