export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  /** Buy/cost price, integer Rupiah. Null until known (filled via purchasing). */
  costPrice: number | null;
  /** Sell price per tier id, integer Rupiah. Must contain the "umum" tier. */
  prices: Record<string, number>;
  categoryId: string | null;
  /** Units on hand. Decrements on sale. */
  stock: number;
  barcode: string | null;
  /** Local file path; null renders a placeholder tile. */
  imagePath: string | null;
}
