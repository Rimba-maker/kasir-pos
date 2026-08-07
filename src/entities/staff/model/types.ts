export interface StaffPermissions {
  products: boolean;
  categories: boolean;
  sales: boolean;
  users: boolean;
  settings: boolean;
}

export interface Staff {
  id: string;
  name: string;
  /** Local login PIN (plain for MVP; hash if login is enforced later). */
  pin: string;
  permissions: StaffPermissions;
}

export const PERMISSION_LABELS: Record<keyof StaffPermissions, string> = {
  products: "Produk",
  categories: "Kategori",
  sales: "Penjualan",
  users: "Staff",
  settings: "Pengaturan",
};
