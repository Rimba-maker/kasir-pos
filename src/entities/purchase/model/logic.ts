import type { Payable } from "@/entities/supplier";
import type { GoodsReceipt, GoodsReceiptLine, POStatus, PurchaseOrder } from "./types";

/** Ordered quantity per product (base units) for a PO. */
export function orderedBase(po: PurchaseOrder): Record<string, number> {
  const out: Record<string, number> = {};
  for (const l of po.lines) out[l.productId] = (out[l.productId] ?? 0) + l.baseQty;
  return out;
}

/** Received quantity per product (base units) across a PO's receipts. */
export function receivedBase(receipts: GoodsReceipt[], poId: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of receipts.filter((x) => x.poId === poId)) {
    for (const l of r.lines) out[l.productId] = (out[l.productId] ?? 0) + l.qty;
  }
  return out;
}

/** Derived status: draft stays draft; else ordered → partial → completed by receipts. */
export function poStatus(po: PurchaseOrder, receipts: GoodsReceipt[]): POStatus {
  if (po.status === "draft") return "draft";
  const ordered = orderedBase(po);
  const received = receivedBase(receipts, po.id);
  const totalOrdered = Object.values(ordered).reduce((a, b) => a + b, 0);
  const totalReceived = Object.keys(ordered).reduce(
    (sum, id) => sum + Math.min(received[id] ?? 0, ordered[id]),
    0,
  );
  if (totalReceived <= 0) return "ordered";
  if (totalReceived < totalOrdered) return "partial";
  return "completed";
}

/** Total value of a set of received lines (base qty × base cost). */
export function receiptValue(lines: GoodsReceiptLine[]): number {
  return lines.reduce((sum, l) => sum + l.qty * l.unitCost, 0);
}

/** One payable per goods receipt, due per its PO — feeds supplier aging. */
export function poPayables(orders: PurchaseOrder[], receipts: GoodsReceipt[]): Payable[] {
  const byId = new Map(orders.map((o) => [o.id, o]));
  return receipts.map((r) => {
    const po = byId.get(r.poId);
    return {
      id: r.id,
      amount: receiptValue(r.lines),
      dueDate: po?.dueDate ?? po?.createdAt ?? r.at,
    };
  });
}
