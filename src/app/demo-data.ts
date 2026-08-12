import type { Category, Product } from "@/entities/product";

// Demo catalog for browser dev (no Tauri backend). Replaced by DB data in-app.
export const demoCategories: Category[] = [
  { id: "c1", name: "Minuman" },
  { id: "c2", name: "Makanan" },
  { id: "c3", name: "Snack" },
];

export const demoProducts: Product[] = [
  { id: "p1", name: "Kopi Susu", costPrice: 11_000, prices: { umum: 18_000 }, categoryId: "c1", stock: 40, barcode: "8991001", imagePath: null },
  { id: "p2", name: "Es Teh Manis", costPrice: 4_500, prices: { umum: 8_000 }, categoryId: "c1", stock: 60, barcode: "8991002", imagePath: null },
  { id: "p3", name: "Air Mineral", costPrice: 3_000, prices: { umum: 5_000 }, categoryId: "c1", stock: 3, barcode: "8991003", imagePath: null },
  { id: "p4", name: "Nasi Goreng", costPrice: 14_000, prices: { umum: 22_000 }, categoryId: "c2", stock: 15, barcode: "8991004", imagePath: null },
  { id: "p5", name: "Mie Ayam", costPrice: 12_000, prices: { umum: 20_000 }, categoryId: "c2", stock: 0, barcode: "8991005", imagePath: null },
  { id: "p6", name: "Roti Bakar", costPrice: 9_000, prices: { umum: 15_000 }, categoryId: "c2", stock: 25, barcode: "8991006", imagePath: null },
  { id: "p7", name: "Keripik Singkong", costPrice: 6_000, prices: { umum: 10_000 }, categoryId: "c3", stock: 50, barcode: "8991007", imagePath: null },
  { id: "p8", name: "Coklat Bar", costPrice: 7_000, prices: { umum: 12_000 }, categoryId: "c3", stock: 8, barcode: "8991008", imagePath: null },
];
