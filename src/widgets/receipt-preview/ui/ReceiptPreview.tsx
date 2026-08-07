import type { ReceiptData } from "@/features/print-receipt";
import { formatRupiah } from "@/shared/lib/currency";

interface ReceiptPreviewProps {
  data: ReceiptData;
}

/** Thermal-style receipt preview (58mm look). Mirrors the ESC/POS layout. */
export function ReceiptPreview({ data }: ReceiptPreviewProps) {
  return (
    <div className="mx-auto max-w-[280px] rounded-md bg-white p-4 font-mono text-xs text-neutral-900 shadow-sm">
      <div className="text-center">
        <p className="font-bold uppercase">{data.storeName}</p>
        {data.address && <p>{data.address}</p>}
        <p className="text-neutral-500">{data.createdAt}</p>
      </div>

      <Divider />
      {data.items.map((it, i) => (
        <div key={i}>
          <p>{it.name}</p>
          <Line label={`  ${it.qty} x`} value={formatRupiah(it.lineTotal)} />
        </div>
      ))}
      <Divider />

      <Line label="Subtotal" value={formatRupiah(data.subtotal)} />
      {data.discountTotal > 0 && (
        <Line label="Diskon" value={`-${formatRupiah(data.discountTotal)}`} />
      )}
      {data.taxTotal > 0 && <Line label="Pajak" value={formatRupiah(data.taxTotal)} />}
      <div className="font-bold">
        <Line label="TOTAL" value={formatRupiah(data.total)} />
      </div>
      {data.amountPaid !== null && <Line label="Tunai" value={formatRupiah(data.amountPaid)} />}
      {data.change !== null && <Line label="Kembalian" value={formatRupiah(data.change)} />}

      {data.footer && <p className="mt-3 text-center">{data.footer}</p>}
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="whitespace-pre">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Divider() {
  return <div className="my-1 border-t border-dashed border-neutral-300" />;
}
