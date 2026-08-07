import { useState } from "react";
import type { Payment } from "@/entities/transaction";
import { formatRupiah } from "@/shared/lib/currency";

interface QrisStaticPanelProps {
  total: number;
  /** Local path to the merchant's static QRIS image (from settings). */
  qrImagePath?: string;
  onConfirm: (payment: Payment) => void;
  onCancel?: () => void;
}

/**
 * Static QRIS: shows the merchant QR + nominal. Confirmation is manual — the
 * cashier must tick that payment landed before confirming (human-error guard).
 */
export function QrisStaticPanel({ total, qrImagePath, onConfirm, onCancel }: QrisStaticPanelProps) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
        Menunggu Konfirmasi Kasir — cek notifikasi pembayaran masuk sebelum konfirmasi.
      </div>

      <div className="flex flex-col items-center gap-2">
        {qrImagePath ? (
          <img src={qrImagePath} alt="QRIS" className="h-48 w-48 object-contain" />
        ) : (
          <div className="flex h-48 w-48 items-center justify-center rounded-md border-2 border-dashed border-neutral-300 text-center text-sm text-neutral-400">
            QRIS statis
            <br />
            (atur di Pengaturan)
          </div>
        )}
        <p className="text-sm text-neutral-600">Scan &amp; bayar sejumlah</p>
        <p className="text-2xl font-bold tabular-nums">{formatRupiah(total)}</p>
      </div>

      <label className="flex items-start gap-2 text-sm text-neutral-700">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="mt-0.5"
        />
        <span>Saya sudah cek notifikasi dan pembayaran sudah masuk.</span>
      </label>

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
          disabled={!checked}
          onClick={() => onConfirm({ method: "qris", amountPaid: total, change: 0 })}
          className="flex-1 rounded-md bg-emerald-600 py-2.5 font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Konfirmasi Pembayaran Diterima
        </button>
      </div>
    </div>
  );
}
