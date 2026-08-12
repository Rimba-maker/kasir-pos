import { expect, test } from "vitest";
import type { Transaction } from "@/entities/transaction";
import { customerBalance, customerPaid, customerReceivables } from "./receivables";

const tx = (over: Partial<Transaction>): Transaction => ({
  id: "t",
  createdAt: "2026-01-01",
  cashierId: null,
  customerId: "c1",
  status: "paid",
  items: [],
  discountTotal: 0,
  taxRate: 0,
  subtotal: 0,
  taxTotal: 0,
  total: 100_000,
  payment: null,
  paymentStatus: "paid",
  amountPaid: 100_000,
  dueDate: null,
  ...over,
});

const transactions = [
  tx({ id: "paid" }),
  tx({ id: "unpaid", paymentStatus: "unpaid", amountPaid: 0, dueDate: "2026-02-01" }),
  tx({ id: "partial", paymentStatus: "partial", amountPaid: 30_000, dueDate: "2026-02-15" }),
];

test("customerReceivables lists only what is still owed", () => {
  const r = customerReceivables(transactions, "c1");
  expect(r.map((x) => x.id).sort()).toEqual(["partial", "unpaid"]);
  expect(r.find((x) => x.id === "partial")!.amount).toBe(70_000);
  expect(r.find((x) => x.id === "unpaid")!.amount).toBe(100_000);
});

test("customerBalance nets receivables against collected payments", () => {
  const payments = [{ id: "p1", customerId: "c1", txId: null, amount: 50_000, at: "2026-02-05", method: null, note: null }];
  expect(customerPaid(payments, "c1")).toBe(50_000);
  expect(customerBalance(transactions, payments, "c1")).toBe(120_000); // 170k owed − 50k paid
});
