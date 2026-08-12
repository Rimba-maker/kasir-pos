import { expect, test } from "vitest";
import { rolePermissions } from "./roles";

test("cashier can sell but not manage products", () => {
  const p = rolePermissions("cashier");
  expect(p.sales).toBe(true);
  expect(p.products).toBe(false);
});

test("warehouse staff manage stock but not sales", () => {
  const p = rolePermissions("warehouse");
  expect(p.products).toBe(true);
  expect(p.sales).toBe(false);
});

test("owner has everything; unknown role has nothing", () => {
  expect(Object.values(rolePermissions("owner")).every(Boolean)).toBe(true);
  expect(Object.values(rolePermissions("nope")).some(Boolean)).toBe(false);
});
