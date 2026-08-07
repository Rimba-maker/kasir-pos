import { expect, test } from "vitest";
import type { Transaction } from "@/entities/transaction";
import { buildReceiptData } from "./receipt";

const tx: Transaction = {
  id: "t1",
  createdAt: "2026-08-07T03:00:00.000Z",
  cashierId: null,
  customerId: null,
  status: "paid",
  items: [
    { productId: "p1", name: "Kopi", unitPrice: 10_000, qty: 2, discount: 0 },
    { productId: "p2", name: "Teh", unitPrice: 5_000, qty: 1, discount: 1_000 },
  ],
  discountTotal: 0,
  taxRate: 0,
  subtotal: 24_000,
  taxTotal: 0,
  total: 24_000,
  payment: { method: "cash", amountPaid: 50_000, change: 26_000 },
};

test("maps transaction items to receipt lines with line totals", () => {
  const r = buildReceiptData(tx, { name: "Toko Maju", footer: "Terima kasih" });
  expect(r.storeName).toBe("Toko Maju");
  expect(r.items).toEqual([
    { name: "Kopi", qty: 2, lineTotal: 20_000 },
    { name: "Teh", qty: 1, lineTotal: 4_000 },
  ]);
  expect(r.amountPaid).toBe(50_000);
  expect(r.change).toBe(26_000);
  expect(r.footer).toBe("Terima kasih");
});

test("nulls out payment fields for a held transaction", () => {
  const held = { ...tx, status: "held" as const, payment: null };
  const r = buildReceiptData(held, { name: "Toko Maju" });
  expect(r.amountPaid).toBeNull();
  expect(r.change).toBeNull();
  expect(r.address).toBeNull();
});
