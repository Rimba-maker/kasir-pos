import { expect, test } from "vitest";
import { kitStock } from "./kit";

const products = [
  { id: "a", stock: 10 },
  { id: "b", stock: 5 },
];

test("kit availability is limited by its scarcest component", () => {
  expect(kitStock({ components: [{ productId: "a", qty: 2 }, { productId: "b", qty: 1 }] }, products)).toBe(5);
  expect(kitStock({ components: [{ productId: "a", qty: 2 }, { productId: "b", qty: 2 }] }, products)).toBe(2);
});

test("a kit with no components has zero stock", () => {
  expect(kitStock({ components: [] }, products)).toBe(0);
  expect(kitStock({}, products)).toBe(0);
});

test("a missing component makes the kit unavailable", () => {
  expect(kitStock({ components: [{ productId: "ghost", qty: 1 }] }, products)).toBe(0);
});
