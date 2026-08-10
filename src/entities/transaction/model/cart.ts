import { create } from "zustand";
import { calcTotals, type Totals } from "./calc";

export interface CartLine {
  productId: string;
  name: string;
  unitPrice: number;
  qty: number;
  /** Per-line discount amount in Rupiah. */
  discount: number;
}

interface CartState {
  lines: CartLine[];
  /** Transaction-level discount in Rupiah. */
  discountTotal: number;
  /** Tax rate 0..1; 0 when tax disabled. */
  taxRate: number;
  /** Optional customer attached to this sale. */
  customerId: string | null;

  addItem: (p: { id: string; name: string; price: number }, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  changeQty: (productId: string, delta: number) => void;
  removeLine: (productId: string) => void;
  setDiscountTotal: (amount: number) => void;
  setTaxRate: (rate: number) => void;
  setCustomer: (id: string | null) => void;
  /** Replace the whole cart (used when resuming a held sale). */
  loadDraft: (draft: {
    lines: CartLine[];
    discountTotal: number;
    taxRate: number;
    customerId: string | null;
  }) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  lines: [],
  discountTotal: 0,
  taxRate: 0,
  customerId: null,

  addItem: (p, qty = 1) =>
    set((s) => {
      const i = s.lines.findIndex((l) => l.productId === p.id);
      if (i >= 0) {
        const next = s.lines.slice();
        next[i] = { ...next[i], qty: next[i].qty + qty };
        return { lines: next };
      }
      return {
        lines: [
          ...s.lines,
          { productId: p.id, name: p.name, unitPrice: p.price, qty, discount: 0 },
        ],
      };
    }),

  setQty: (productId, qty) =>
    set((s) => ({
      lines:
        qty <= 0
          ? s.lines.filter((l) => l.productId !== productId)
          : s.lines.map((l) => (l.productId === productId ? { ...l, qty } : l)),
    })),

  changeQty: (productId, delta) =>
    set((s) => ({
      lines: s.lines.flatMap((l) => {
        if (l.productId !== productId) return [l];
        const qty = l.qty + delta;
        return qty <= 0 ? [] : [{ ...l, qty }];
      }),
    })),

  removeLine: (productId) =>
    set((s) => ({ lines: s.lines.filter((l) => l.productId !== productId) })),

  setDiscountTotal: (amount) => set({ discountTotal: Math.max(0, amount) }),
  setTaxRate: (rate) => set({ taxRate: Math.max(0, rate) }),
  setCustomer: (id) => set({ customerId: id }),
  loadDraft: (draft) =>
    set({
      lines: draft.lines.map((l) => ({ ...l })),
      discountTotal: draft.discountTotal,
      taxRate: draft.taxRate,
      customerId: draft.customerId,
    }),
  clear: () => set({ lines: [], discountTotal: 0, taxRate: 0, customerId: null }),
}));

/** Pure totals from a cart snapshot — reuses the transaction money core. */
export function cartTotals(
  s: Pick<CartState, "lines" | "discountTotal" | "taxRate">,
): Totals {
  return calcTotals({ items: s.lines, discountTotal: s.discountTotal, taxRate: s.taxRate });
}
