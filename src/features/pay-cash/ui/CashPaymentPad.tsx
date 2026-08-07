import { useState } from "react";
import { calcChange, type Payment } from "@/entities/transaction";
import { CASH_SHORTCUTS } from "@/shared/config";
import { formatRupiah } from "@/shared/lib/currency";
import { Button } from "@/shared/ui/Button";

interface CashPaymentPadProps {
  total: number;
  onConfirm: (payment: Payment) => void;
  onCancel?: () => void;
}

/** Cash pad: nominal shortcuts + Uang Pas, computes change, confirm when paid >= total. */
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

      <div className="grid grid-cols-3 gap-2">
        {CASH_SHORTCUTS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setPaid(n)}
            className="cursor-pointer rounded-lg border border-border py-2.5 text-sm font-medium text-fg transition-colors hover:border-primary hover:bg-surface-2"
          >
            {formatRupiah(n)}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setPaid(total)}
          className="cursor-pointer rounded-lg border border-border py-2.5 text-sm font-medium text-primary transition-colors hover:border-primary hover:bg-surface-2"
        >
          Uang Pas
        </button>
      </div>

      <label className="block text-sm">
        <span className="text-muted">Uang diterima</span>
        <input
          type="number"
          min={0}
          value={paid || ""}
          onChange={(e) => setPaid(Number(e.target.value) || 0)}
          placeholder="0"
          className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-right text-lg font-semibold tabular-nums text-fg outline-none focus:border-primary"
          autoFocus
        />
      </label>

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
