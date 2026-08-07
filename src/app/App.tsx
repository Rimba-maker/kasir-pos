import { useEffect, useState } from "react";
import {
  BarChart3,
  LogOut,
  Package,
  Receipt,
  Settings2,
  Store,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useCatalogStore } from "@/entities/product";
import { useStaffStore, type StaffPermissions } from "@/entities/staff";
import { LoginScreen, useSessionStore } from "@/features/auth";
import { TillPage } from "@/pages/till";
import { CatalogPage } from "@/pages/catalog";
import { SalesHistoryPage } from "@/pages/sales-history";
import { StaffPage } from "@/pages/staff";
import { SettingsPage } from "@/pages/settings";
import { categoryApi, productApi, isTauri } from "@/shared/api/pos";
import { ThemeToggle } from "@/shared/ui/ThemeToggle";
import { demoCategories, demoProducts } from "./demo-data";

type Route = "till" | "catalog" | "sales" | "staff" | "settings";

// perm: null = always allowed (cashier). Otherwise the flag required.
const NAV: { key: Route; label: string; icon: LucideIcon; perm: keyof StaffPermissions | null }[] = [
  { key: "till", label: "Kasir", icon: Receipt, perm: null },
  { key: "catalog", label: "Katalog", icon: Package, perm: "products" },
  { key: "sales", label: "Riwayat", icon: BarChart3, perm: "sales" },
  { key: "staff", label: "Staff", icon: Users, perm: "users" },
  { key: "settings", label: "Pengaturan", icon: Settings2, perm: "settings" },
];

export function App() {
  const [route, setRoute] = useState<Route>("till");
  const setProducts = useCatalogStore((s) => s.setProducts);
  const setCategories = useCatalogStore((s) => s.setCategories);
  const staff = useStaffStore((s) => s.staff);
  const currentUser = useSessionStore((s) => s.currentUser);
  const logout = useSessionStore((s) => s.logout);

  useEffect(() => {
    if (isTauri()) {
      productApi.list().then(setProducts).catch(() => {});
      categoryApi.list().then(setCategories).catch(() => {});
    } else {
      setCategories(demoCategories);
      setProducts(demoProducts);
    }
  }, [setProducts, setCategories]);

  // Gate: once staff accounts exist, require login. Fresh install = open access.
  if (staff.length > 0 && !currentUser) return <LoginScreen />;

  const visibleNav = NAV.filter((n) => n.perm === null || !currentUser || currentUser.permissions[n.perm]);

  return (
    <div className="flex h-screen bg-bg text-fg">
      <nav className="flex w-20 flex-col items-center border-r border-border bg-surface py-3">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-on-primary">
          <Store className="h-5 w-5" />
        </div>
        <div className="flex flex-1 flex-col items-center gap-1">
          {visibleNav.map((n) => {
            const Icon = n.icon;
            const active = route === n.key;
            return (
              <button
                key={n.key}
                type="button"
                onClick={() => setRoute(n.key)}
                aria-current={active ? "page" : undefined}
                className={`flex w-16 cursor-pointer flex-col items-center gap-1 rounded-lg py-2 text-[11px] font-medium transition-colors ${
                  active ? "bg-primary text-on-primary" : "text-muted hover:bg-surface-2 hover:text-fg"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={2} />
                {n.label}
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex flex-col items-center gap-1 border-t border-border pt-2">
          <ThemeToggle />
          {currentUser && (
            <button
              type="button"
              onClick={() => {
                logout();
                setRoute("till");
              }}
              title={`Keluar (${currentUser.name})`}
              aria-label={`Keluar (${currentUser.name})`}
              className="flex w-16 cursor-pointer flex-col items-center gap-1 rounded-lg py-2 text-[11px] font-medium text-muted transition-colors hover:bg-surface-2 hover:text-danger"
            >
              <LogOut className="h-5 w-5" strokeWidth={2} />
              Keluar
            </button>
          )}
        </div>
      </nav>
      <main className="min-w-0 flex-1">
        {route === "till" && <TillPage />}
        {route === "catalog" && <CatalogPage />}
        {route === "sales" && <SalesHistoryPage onResumed={() => setRoute("till")} />}
        {route === "staff" && <StaffPage />}
        {route === "settings" && <SettingsPage />}
      </main>
    </div>
  );
}
