// Public API of the product entity.
export type { Product, Category, ProductUnit, KitComponent } from "./model/types";
export { sellPrice, DEFAULT_TIER, DEFAULT_PRICE_TIERS, type PriceTier } from "./model/pricing";
export { toBaseQty, unitSellPrice } from "./model/units";
export { kitStock } from "./model/kit";
export { variantLabel, groupProducts, skuInUse, type CatalogEntry } from "./model/variants";
export { useCatalogStore } from "./model/store";
export { ProductCard } from "./ui/ProductCard";
export { StockBadge } from "./ui/StockBadge";
