interface StockBadgeProps {
  stock: number;
}

/** Small status pill: out / low / in-stock. */
export function StockBadge({ stock }: StockBadgeProps) {
  const { label, cls } =
    stock <= 0
      ? { label: "Habis", cls: "bg-red-100 text-red-700" }
      : stock <= 5
        ? { label: `Sisa ${stock}`, cls: "bg-amber-100 text-amber-700" }
        : { label: `Stok ${stock}`, cls: "bg-emerald-100 text-emerald-700" };

  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}
