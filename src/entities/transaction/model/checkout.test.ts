import { expect, test } from "vitest";
import { buildTransaction } from "./checkout";

const lines = [
  { productId: "p1", name: "Kopi", unitPrice: 10_000, qty: 2, discount: 0 },
  { productId: "p2", name: "Teh", unitPrice: 5_000, qty: 1, discount: 1_000 },
];

test("computes totals and maps items", () => {
  const tx = buildTransaction({
    lines,
    discountTotal: 0,
    taxRate: 0,
    status: "paid",
    payment: { method: "cash", amountPaid: 30_000, change: 6_000 },
    id: "fixed",
    createdAt: "2026-08-07T00:00:00.000Z",
  });
  expect(tx.id).toBe("fixed");
  expect(tx.subtotal).toBe(24_000);
  expect(tx.total).toBe(24_000);
  expect(tx.items).toHaveLength(2);
  expect(tx.payment?.change).toBe(6_000);
});

test("held transaction carries no payment", () => {
  const tx = buildTransaction({
    lines,
    discountTotal: 0,
    taxRate: 0,
    status: "held",
    payment: null,
    id: "h1",
  });
  expect(tx.status).toBe("held");
  expect(tx.payment).toBeNull();
});
