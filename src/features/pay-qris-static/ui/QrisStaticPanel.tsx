import { useState } from "react";
import { Clock, QrCode } from "lucide-react";
import type { Payment } from "@/entities/transaction";
import { formatRupiah } from "@/shared/lib/currency";
import { Button } from "@/shared/ui/Button";

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
      <div className="flex items-center gap-2 rounded-lg bg-warning-bg px-3 py-2.5 text-sm text-warning-fg">
        <Clock className="h-4 w-4 shrink-0" />
        <span>Menunggu Konfirmasi Kasir — cek notifikasi pembayaran masuk dulu.</span>
      </div>

      <div className="flex flex-col items-center gap-2">
        {qrImagePath ? (
          <img src={qrImagePath} alt="QRIS" className="h-48 w-48 rounded-lg object-contain" />
        ) : (
          <div className="flex h-48 w-48 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border text-center text-sm text-muted">
            <QrCode className="h-10 w-10" strokeWidth={1.5} />
            QRIS statis
            <span className="text-xs">(atur di Pengaturan)</span>
          </div>
        )}
        <p className="text-sm text-muted">Scan &amp; bayar sejumlah</p>
        <p className="text-2xl font-bold tabular-nums text-fg">{formatRupiah(total)}</p>
      </div>

      <label className="flex items-start gap-2 rounded-lg border border-border p-3 text-sm text-fg">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="mt-0.5 accent-[var(--color-primary)]"
        />
        <span>Saya sudah cek notifikasi dan pembayaran sudah masuk.</span>
      </label>

      <div className="flex gap-2">
        {onCancel && (
          <Button variant="outline" size="lg" onClick={onCancel} className="flex-1">
            Batal
          </Button>
        )}
        <Button
          variant="accent"
          size="lg"
          disabled={!checked}
          onClick={() => onConfirm({ method: "qris", amountPaid: total, change: 0 })}
          className="flex-1"
        >
          Konfirmasi Diterima
        </Button>
      </div>
    </div>
  );
}
