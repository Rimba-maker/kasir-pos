import type { TransactionStatus } from "../model/types";

/** Paid / held status pill for history rows. */
export function TransactionStatusBadge({ status }: { status: TransactionStatus }) {
  const { label, cls } =
    status === "paid"
      ? { label: "Lunas", cls: "bg-emerald-100 text-emerald-700" }
      : { label: "Ditahan", cls: "bg-amber-100 text-amber-700" };

  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}
