import { useEffect, useState } from "react";
import {
  BarChart3,
  CalendarClock,
  ClipboardCheck,
  LogOut,
  Package,
  Receipt,
  Settings2,
  ShoppingBag,
  Store,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useCatalogStore } from "@/entities/product";
import { useStaffStore, type StaffPermissions } from "@/entities/staff";
import { LoginScreen, useSessionStore } from "@/features/auth";
import { TillPage } from "@/pages/till";
import { CatalogPage } from "@/pages/catalog";
import { SuppliersPage } from "@/pages/suppliers";
import { PurchaseOrdersPage } from "@/pages/purchases";
import { OpnamePage } from "@/pages/opname";
import { BatchesPage } from "@/pages/batches";
import { SalesHistoryPage } from "@/pages/sales-history";
import { StaffPage } from "@/pages/staff";
import { SettingsPage } from "@/pages/settings";
import { categoryApi, productApi, isTauri } from "@/shared/api/pos";
import { ThemeToggle } from "@/shared/ui/ThemeToggle";
import { demoCategories, demoProducts } from "./demo-data";

type Route = "till" | "catalog" | "suppliers" | "purchases" | "opname" | "batches" | "sales" | "staff" | "settings";

// perm: null = always allowed (cashier). Otherwise the flag required.
const NAV: { key: Route; label: string; icon: LucideIcon; perm: keyof StaffPermissions | null }[] = [
  { key: "till", label: "Kasir", icon: Receipt, perm: null },
  { key: "catalog", label: "Katalog", icon: Package, perm: "products" },
  { key: "suppliers", label: "Supplier", icon: Truck, perm: "products" },
  { key: "purchases", label: "Pembelian", icon: ShoppingBag, perm: "products" },
  { key: "opname", label: "Opname", icon: ClipboardCheck, perm: "products" },
  { key: "batches", label: "Batch", icon: CalendarClock, perm: "products" },
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

  const onLogout = () => {
    logout();
    setRoute("till");
  };

  return (
    <div className="flex h-[100dvh] flex-col bg-bg text-fg">
      {/* Mobile top app bar — brand + theme + logout (the rail hosts these on desktop) */}
      <header className="flex shrink-0 items-center justify-between border-b border-border bg-surface px-4 py-2 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-on-primary">
            <Store className="h-4 w-4" />
          </div>
          <span className="font-bold text-fg">Kasir POS</span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          {currentUser && (
            <button
              type="button"
              onClick={onLogout}
              aria-label={`Keluar (${currentUser.name})`}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-danger"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col-reverse md:flex-row">
        {/* Nav: bottom bar (mobile) → left rail (desktop) */}
        <nav className="flex shrink-0 items-stretch justify-around border-t border-border bg-surface md:w-20 md:flex-col md:justify-start md:border-r md:border-t-0 md:py-3">
          <div className="mb-3 hidden h-10 w-10 items-center justify-center self-center rounded-xl bg-primary text-on-primary md:flex">
            <Store className="h-5 w-5" />
          </div>
          <div className="flex flex-1 items-stretch justify-around md:flex-col md:items-center md:justify-start md:gap-1">
            {visibleNav.map((n) => {
              const Icon = n.icon;
              const active = route === n.key;
              return (
                <button
                  key={n.key}
                  type="button"
                  onClick={() => setRoute(n.key)}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-[52px] flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-medium transition-colors md:min-h-0 md:w-16 md:flex-none md:py-2 ${
                    active
                      ? "text-primary md:bg-primary md:text-on-primary"
                      : "text-muted hover:bg-surface-2 hover:text-fg"
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={2} />
                  {n.label}
                </button>
              );
            })}
          </div>
          <div className="mt-2 hidden flex-col items-center gap-1 border-t border-border pt-2 md:flex">
            <ThemeToggle />
            {currentUser && (
              <button
                type="button"
                onClick={onLogout}
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

        <main className="min-h-0 min-w-0 flex-1 overflow-hidden">
          {route === "till" && <TillPage />}
          {route === "catalog" && <CatalogPage />}
          {route === "suppliers" && <SuppliersPage />}
          {route === "purchases" && <PurchaseOrdersPage />}
          {route === "opname" && <OpnamePage />}
          {route === "batches" && <BatchesPage />}
          {route === "sales" && <SalesHistoryPage onResumed={() => setRoute("till")} />}
          {route === "staff" && <StaffPage />}
          {route === "settings" && <SettingsPage />}
        </main>
      </div>
    </div>
  );
}
