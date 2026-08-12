import type { StaffPermissions } from "./types";

export interface Role {
  id: string;
  name: string;
  permissions: StaffPermissions;
}

const ALL: StaffPermissions = { products: true, categories: true, sales: true, users: true, settings: true };
const NONE: StaffPermissions = { products: false, categories: false, sales: false, users: false, settings: false };

/** Preset roles; assigning one seeds a staff member's permissions. */
export const ROLE_PRESETS: Role[] = [
  { id: "owner", name: "Owner", permissions: { ...ALL } },
  { id: "manager", name: "Manager", permissions: { products: true, categories: true, sales: true, users: false, settings: false } },
  { id: "cashier", name: "Kasir", permissions: { products: false, categories: false, sales: true, users: false, settings: false } },
  { id: "warehouse", name: "Staf Gudang", permissions: { products: true, categories: true, sales: false, users: false, settings: false } },
];

/** Permission preset for a role id (all-false for an unknown role). */
export function rolePermissions(roleId: string): StaffPermissions {
  return ROLE_PRESETS.find((r) => r.id === roleId)?.permissions ?? { ...NONE };
}
