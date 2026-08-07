import { expect, test } from "vitest";
import type { Staff } from "@/entities/staff";
import { authenticate } from "./authenticate";

const perms = { products: true, categories: true, sales: true, users: false, settings: false };
const staff: Staff[] = [
  { id: "s1", name: "Andi", pin: "1234", permissions: perms },
  { id: "s2", name: "Budi", pin: "0000", permissions: perms },
];

test("matches by case-insensitive name and exact pin", () => {
  expect(authenticate(staff, "andi", "1234")?.id).toBe("s1");
  expect(authenticate(staff, "  BUDI ", "0000")?.id).toBe("s2");
});

test("rejects wrong pin or unknown name", () => {
  expect(authenticate(staff, "Andi", "9999")).toBeNull();
  expect(authenticate(staff, "Charlie", "1234")).toBeNull();
});
