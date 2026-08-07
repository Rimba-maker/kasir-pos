export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  /** Integer Rupiah — no sub-unit. */
  price: number;
  categoryId: string | null;
  /** Units on hand. Decrements on sale. */
  stock: number;
  barcode: string | null;
  /** Local file path; null renders a placeholder tile. */
  imagePath: string | null;
}
