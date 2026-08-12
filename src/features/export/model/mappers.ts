import { sellPrice, type Product } from "@/entities/product";
import type { Customer } from "@/entities/customer";
import type { Transaction } from "@/entities/transaction";

export type Row = Record<string, unknown>;

export function productToRow(p: Product): Row {
  return {
    Nama: p.name,
    "Harga Jual": sellPrice(p),
    "Harga Beli": p.costPrice ?? "",
    Stok: p.stock,
    Barcode: p.barcode ?? "",
  };
}

/** Build a Product from an imported spreadsheet row (headers or fallbacks). */
export function rowToProduct(row: Row): Product {
  const name = String(row["Nama"] ?? row["name"] ?? "").trim();
  const price = Number(row["Harga Jual"] ?? row["harga"] ?? 0) || 0;
  const cost = Number(row["Harga Beli"] ?? 0) || 0;
  const stock = Number(row["Stok"] ?? 0) || 0;
  const barcodeRaw = row["Barcode"];
  return {
    id: crypto.randomUUID(),
    name,
    costPrice: cost > 0 ? cost : null,
    prices: { umum: price },
    baseUnit: "pcs",
    units: [],
    categoryId: null,
    stock,
    barcode: barcodeRaw != null && String(barcodeRaw).trim() ? String(barcodeRaw).trim() : null,
    imagePath: null,
  };
}

export function customerToRow(c: Customer): Row {
  return { Nama: c.name, Telepon: c.phone ?? "", Kota: c.city ?? "" };
}

export function transactionToRow(t: Transaction): Row {
  return {
    ID: t.id,
    Tanggal: t.createdAt.slice(0, 10),
    Item: t.items.reduce((n, i) => n + i.qty, 0),
    Total: t.total,
    Status: t.paymentStatus ?? "paid",
  };
}
