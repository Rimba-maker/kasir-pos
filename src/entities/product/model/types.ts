export interface Category {
  id: string;
  name: string;
}

export interface ProductUnit {
  name: string;
  /** How many base units this equals (base unit is implicit, factor 1). */
  factor: number;
  barcode?: string | null;
  /** Optional per-tier price override; falls back to factor × base price. */
  prices?: Record<string, number>;
}

export interface KitComponent {
  productId: string;
  /** Base-unit quantity of this component per one kit. */
  qty: number;
}

export interface Product {
  id: string;
  name: string;
  /** Buy/cost price, integer Rupiah. Null until known (filled via purchasing). */
  costPrice: number | null;
  /** Sell price per tier id, integer Rupiah. Must contain the "umum" tier. */
  prices: Record<string, number>;
  /** Base stock unit (smallest integer unit, e.g. "pcs", "gram"). */
  baseUnit: string;
  /** Larger sell/buy units (box, karton, kg) converted via factor. */
  units: ProductUnit[];
  /** When true, stock is tracked per batch with expiry (FEFO). */
  trackBatch?: boolean;
  /** When true, this is a kit: selling it decrements its components. */
  isKit?: boolean;
  /** Component products consumed when a kit is sold. */
  components?: KitComponent[];
  /** Low-stock threshold (base units); stock ≤ this flags a reorder. */
  reorderPoint?: number | null;
  /** Suggested reorder quantity (base units). */
  reorderQty?: number | null;
  /** Preferred supplier, used to group auto-PO suggestions. */
  defaultSupplierId?: string | null;
  categoryId: string | null;
  /** Stock keeping unit code (optional, unique across products when set). */
  sku?: string | null;
  /** Shared label grouping this row with its sibling variants (e.g. "Kaos Polos"). null = standalone. */
  variantGroup?: string | null;
  /** This variant's distinguishing label within its group (e.g. "Merah / L"). */
  variantName?: string | null;
  /** Units on hand, in base unit. Decrements on sale. */
  stock: number;
  barcode: string | null;
  /** Local file path; null renders a placeholder tile. */
  imagePath: string | null;
}
