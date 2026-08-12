import type { Transaction } from "@/entities/transaction";
import type { CustomerPayment } from "./types";

/** An outstanding amount owed by a customer (same shape as supplier Payable). */
export interface Receivable {
  id: string;
  amount: number;
  dueDate: string;
}

/** Unpaid/partial sales of a customer, as due-dated receivables. */
export function customerReceivables(transactions: Transaction[], customerId: string): Receivable[] {
  return transactions
    .filter((t) => t.customerId === customerId && t.paymentStatus && t.paymentStatus !== "paid")
    .map((t) => ({ id: t.id, amount: t.total - (t.amountPaid ?? 0), dueDate: t.dueDate ?? t.createdAt }));
}

/** Total collected from a customer (post-sale payments). */
export function customerPaid(payments: CustomerPayment[], customerId: string): number {
  return payments.filter((p) => p.customerId === customerId).reduce((sum, p) => sum + p.amount, 0);
}

/** Outstanding balance = owed on unpaid/partial sales − collected. */
export function customerBalance(
  transactions: Transaction[],
  payments: CustomerPayment[],
  customerId: string,
): number {
  const owed = customerReceivables(transactions, customerId).reduce((sum, r) => sum + r.amount, 0);
  return owed - customerPaid(payments, customerId);
}
