export interface ShiftReconciliation {
  expected: number;
  variance: number;
}

/**
 * Physical-cash reconciliation for a shift:
 *   expected = opening float + cash sales + petty cash in − petty cash out
 *   variance = counted − expected  (positive = surplus, negative = short)
 */
export function reconcileShift(input: {
  openingCash: number;
  cashSalesTotal: number;
  cashIn: number;
  cashOut: number;
  counted: number;
}): ShiftReconciliation {
  const expected = input.openingCash + input.cashSalesTotal + input.cashIn - input.cashOut;
  return { expected, variance: input.counted - expected };
}
