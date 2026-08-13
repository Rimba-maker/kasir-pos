import { expect, test } from "vitest";
import { formatRupiah, formatRupiahShort } from "./currency";

test("formats with thousands grouping", () => {
  expect(formatRupiah(10_000)).toBe("Rp10.000");
  expect(formatRupiah(1_500_000)).toBe("Rp1.500.000");
});

test("handles zero and negatives (change/refund)", () => {
  expect(formatRupiah(0)).toBe("Rp0");
  expect(formatRupiah(-2_500)).toBe("-Rp2.500");
});

test("rounds floats to whole Rupiah", () => {
  expect(formatRupiah(9_999.6)).toBe("Rp10.000");
});

test("formatRupiahShort compacts thousands, leaves coins whole", () => {
  expect(formatRupiahShort(100_000)).toBe("100rb");
  expect(formatRupiahShort(1_000)).toBe("1rb");
  expect(formatRupiahShort(500)).toBe("500");
  expect(formatRupiahShort(100)).toBe("100");
});
