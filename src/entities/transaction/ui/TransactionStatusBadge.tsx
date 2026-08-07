import type { TransactionStatus } from "../model/types";

/** Paid / held status pill for history rows. */
export function TransactionStatusBadge({ status }: { status: TransactionStatus }) {
  const { label, cls } =
    status === "paid"
      ? { label: "Lunas", cls: "badge-success" }
      : { label: "Ditahan", cls: "badge-warning" };

  return <span className={`badge ${cls}`}>{label}</span>;
}
