import { buildTransaction, useCartStore, useSalesStore, type Transaction } from "@/entities/transaction";
import { transactionApi, isTauri } from "@/shared/api/pos";

/** Save the current cart as a held sale, then empty the cart. */
export async function holdSale(): Promise<void> {
  const cart = useCartStore.getState();
  if (cart.lines.length === 0) return;
  const tx = buildTransaction({
    lines: cart.lines,
    discountTotal: cart.discountTotal,
    taxRate: cart.taxRate,
    status: "held",
    payment: null,
    customerId: cart.customerId,
  });
  if (isTauri()) await transactionApi.create(tx);
  useSalesStore.getState().add(tx);
  cart.clear();
}

/** Load a held sale back into the cart and remove the held record. */
export async function resumeSale(tx: Transaction): Promise<void> {
  useCartStore.getState().loadDraft({
    lines: tx.items.map((i) => ({
      productId: i.productId,
      name: i.name,
      unitPrice: i.unitPrice,
      qty: i.qty,
      discount: i.discount,
    })),
    discountTotal: tx.discountTotal,
    taxRate: tx.taxRate,
    customerId: tx.customerId,
  });
  useSalesStore.getState().remove(tx.id);
  if (isTauri()) await transactionApi.remove(tx.id);
}
