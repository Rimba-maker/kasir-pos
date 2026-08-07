interface StockBadgeProps {
  stock: number;
}

/** Small status pill: out / low / in-stock. */
export function StockBadge({ stock }: StockBadgeProps) {
  const { label, cls } =
    stock <= 0
      ? { label: "Habis", cls: "badge-danger" }
      : stock <= 5
        ? { label: `Sisa ${stock}`, cls: "badge-warning" }
        : { label: `Stok ${stock}`, cls: "badge-success" };

  return <span className={`badge ${cls}`}>{label}</span>;
}
