import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CashMovement, Shift } from "./types";

interface ShiftState {
  shifts: Shift[];
  cashMovements: CashMovement[];
  open: (openingCash: number, openedBy?: string | null) => Shift;
  addCash: (shiftId: string, type: "in" | "out", amount: number, note?: string | null) => void;
  close: (shiftId: string, counted: number, expected: number) => void;
}

/** Cashier shifts + petty-cash movements, persisted per-device (offline). */
export const useShiftStore = create<ShiftState>()(
  persist(
    (set) => ({
      shifts: [],
      cashMovements: [],
      open: (openingCash, openedBy = null) => {
        const shift: Shift = {
          id: crypto.randomUUID(),
          openedAt: new Date().toISOString(),
          openedBy,
          openingCash: Math.max(0, Math.round(openingCash)),
          closedAt: null,
          closingCounted: null,
          closingExpected: null,
          status: "open",
        };
        set((s) => ({ shifts: [shift, ...s.shifts] }));
        return shift;
      },
      addCash: (shiftId, type, amount, note = null) =>
        set((s) => ({
          cashMovements: [
            { id: crypto.randomUUID(), shiftId, type, amount: Math.max(0, Math.round(amount)), note, at: new Date().toISOString() },
            ...s.cashMovements,
          ],
        })),
      close: (shiftId, counted, expected) =>
        set((s) => ({
          shifts: s.shifts.map((sh) =>
            sh.id === shiftId
              ? {
                  ...sh,
                  status: "closed",
                  closedAt: new Date().toISOString(),
                  closingCounted: Math.max(0, Math.round(counted)),
                  closingExpected: Math.round(expected),
                }
              : sh,
          ),
        })),
    }),
    { name: "pos-shifts" },
  ),
);

/** The currently open shift, if any. */
export function currentShift(shifts: Shift[]): Shift | undefined {
  return shifts.find((s) => s.status === "open");
}
