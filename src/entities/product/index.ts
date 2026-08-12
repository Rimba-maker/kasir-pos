// Public API of the product entity.
export type { Product, Category, ProductUnit } from "./model/types";
export { sellPrice, DEFAULT_TIER, DEFAULT_PRICE_TIERS, type PriceTier } from "./model/pricing";
export { toBaseQty, unitSellPrice } from "./model/units";
export { useCatalogStore } from "./model/store";
export { ProductCard } from "./ui/ProductCard";
export { StockBadge } from "./ui/StockBadge";
