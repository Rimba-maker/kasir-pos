import { invoke } from "@tauri-apps/api/core";
import { lineTotal, type Transaction } from "@/entities/transaction";
import { isTauri } from "@/shared/api/pos";

/** Store identity printed on the receipt. Sourced from settings (step 8). */
export interface StoreInfo {
  name: string;
  address?: string;
  footer?: string;
  /** Printer device/share path; forwarded to the Rust print command. */
  printerTarget?: string;
}

export interface ReceiptLineData {
  name: string;
  qty: number;
  lineTotal: number;
}

/** Shape sent to the Rust `print_receipt` command (camelCase matches serde). */
export interface ReceiptData {
  storeName: string;
  address: string | null;
  createdAt: string;
  items: ReceiptLineData[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  amountPaid: number | null;
  change: number | null;
  footer: string | null;
}

export function buildReceiptData(tx: Transaction, store: StoreInfo): ReceiptData {
  return {
    storeName: store.name,
    address: store.address ?? null,
    createdAt: new Date(tx.createdAt).toLocaleString("id-ID"),
    items: tx.items.map((i) => ({ name: i.name, qty: i.qty, lineTotal: lineTotal(i) })),
    subtotal: tx.subtotal,
    discountTotal: tx.discountTotal,
    taxTotal: tx.taxTotal,
    total: tx.total,
    amountPaid: tx.payment?.amountPaid ?? null,
    change: tx.payment?.change ?? null,
    footer: store.footer ?? null,
  };
}

/** Trigger the hardware print via Tauri. No-op guard outside the desktop shell. */
export async function printReceipt(data: ReceiptData, printerTarget?: string): Promise<void> {
  if (!isTauri()) throw new Error("Cetak struk hanya tersedia di aplikasi desktop.");
  await invoke("print_receipt", { data, printer: printerTarget ?? null });
}
