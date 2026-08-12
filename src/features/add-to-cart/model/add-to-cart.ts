import { kitStock, sellPrice, useCatalogStore, type Product } from "@/entities/product";
import { useCartStore } from "@/entities/transaction";

/**
 * Add a product to the cart, guarding against overselling.
 * Returns false when stock (minus what's already in the cart) is exhausted.
 */
export function addProductToCart(product: Product): boolean {
  const cart = useCartStore.getState();
  const inCart = cart.lines.find((l) => l.productId === product.id)?.qty ?? 0;
  const stock = product.isKit ? kitStock(product, useCatalogStore.getState().products) : product.stock;
  if (stock <= inCart) return false;
  cart.addItem({ id: product.id, name: product.name, price: sellPrice(product) });
  return true;
}
