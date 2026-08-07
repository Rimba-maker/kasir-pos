import { useState } from "react";
import { calcChange, type Payment } from "@/entities/transaction";
import { CASH_SHORTCUTS } from "@/shared/config";
import { formatRupiah } from "@/shared/lib/currency";

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
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-600">Total</span>
        <span className="text-lg font-semibold tabular-nums">{formatRupiah(total)}</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {CASH_SHORTCUTS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setPaid(n)}
            className="rounded-md border border-neutral-300 py-2 text-sm font-medium hover:bg-neutral-100"
          >
            {formatRupiah(n)}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setPaid(total)}
          className="rounded-md border border-neutral-300 py-2 text-sm font-medium hover:bg-neutral-100"
        >
          Uang Pas
        </button>
      </div>

      <label className="block text-sm">
        <span className="text-neutral-600">Uang diterima</span>
        <input
          type="number"
          min={0}
          value={paid || ""}
          onChange={(e) => setPaid(Number(e.target.value) || 0)}
          placeholder="0"
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-right text-lg tabular-nums outline-none focus:border-neutral-500"
          autoFocus
        />
      </label>

      <div className="flex items-center justify-between rounded-md bg-neutral-100 px-3 py-2 text-sm">
        <span className="text-neutral-600">Kembalian</span>
        <span className="text-lg font-semibold tabular-nums">{formatRupiah(change)}</span>
      </div>

      <div className="flex gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-md border border-neutral-300 py-2.5 font-medium hover:bg-neutral-100"
          >
            Batal
          </button>
        )}
        <button
          type="button"
          disabled={!enough}
          onClick={() => onConfirm({ method: "cash", amountPaid: paid, change })}
          className="flex-1 rounded-md bg-emerald-600 py-2.5 font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Konfirmasi
        </button>
      </div>
    </div>
  );
}
