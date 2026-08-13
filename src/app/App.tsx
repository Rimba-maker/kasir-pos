import { useEffect, useState } from "react";
import {
  BarChart3,
  LayoutDashboard,
  LayoutGrid,
  CalendarClock,
  ClipboardCheck,
  Clock,
  LogOut,
  Package,
  PackageSearch,
  Receipt,
  ScrollText,
  Settings2,
  ShoppingBag,
  Store,
  Tag,
  Ticket,
  Truck,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { useCatalogStore } from "@/entities/product";
import { useSettingsStore } from "@/entities/store-settings";
import { useStaffStore, type StaffPermissions } from "@/entities/staff";
import { LoginScreen, useSessionStore } from "@/features/auth";
import { TillPage } from "@/pages/till";
import { CatalogPage } from "@/pages/catalog";
import { SuppliersPage } from "@/pages/suppliers";
import { PurchaseOrdersPage } from "@/pages/purchases";
import { OpnamePage } from "@/pages/opname";
import { BatchesPage } from "@/pages/batches";
import { ReorderPage } from "@/pages/reorder";
import { ShiftPage } from "@/pages/shift";
import { CustomersPage } from "@/pages/customers";
import { PromosPage } from "@/pages/promos";
import { LoyaltyPage } from "@/pages/loyalty";
import { DashboardPage } from "@/pages/dashboard";
import { AuditPage } from "@/pages/audit";
import { SalesHistoryPage } from "@/pages/sales-history";
import { StaffPage } from "@/pages/staff";
import { SettingsPage } from "@/pages/settings";
import { categoryApi, productApi, isTauri } from "@/shared/api/pos";
import { ThemeToggle } from "@/shared/ui/ThemeToggle";
import { demoCategories, demoProducts } from "./demo-data";

type Route = "till" | "dashboard" | "catalog" | "suppliers" | "purchases" | "opname" | "batches" | "reorder" | "shift" | "customers" | "promos" | "loyalty" | "sales" | "staff" | "audit" | "settings";

type Section = "Inventaris" | "Pembelian" | "Penjualan" | "Admin";
const SECTION_ORDER: Section[] = ["Inventaris", "Pembelian", "Penjualan", "Admin"];

// perm: null = always allowed (cashier). Otherwise the flag required.
// flag: optional settings toggle that must be on for the item to show.
// primary: shown in the mobile bottom bar; the rest live in the "Lainnya" sheet, grouped by section.
type NavItem = {
  key: Route;
  label: string;
  icon: LucideIcon;
  perm: keyof StaffPermissions | null;
  flag?: "shiftEnabled";
  primary?: boolean;
  section?: Section;
};

const NAV: NavItem[] = [
  { key: "till", label: "Kasir", icon: Receipt, perm: null, primary: true },
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, perm: "sales", primary: true },
  { key: "catalog", label: "Katalog", icon: Package, perm: "products", primary: true },
  { key: "sales", label: "Riwayat", icon: BarChart3, perm: "sales", primary: true },
  { key: "opname", label: "Opname", icon: ClipboardCheck, perm: "products", section: "Inventaris" },
  { key: "batches", label: "Batch", icon: CalendarClock, perm: "products", section: "Inventaris" },
  { key: "reorder", label: "Menipis", icon: PackageSearch, perm: "products", section: "Inventaris" },
  { key: "suppliers", label: "Supplier", icon: Truck, perm: "products", section: "Pembelian" },
  { key: "purchases", label: "Pembelian", icon: ShoppingBag, perm: "products", section: "Pembelian" },
  { key: "shift", label: "Shift", icon: Clock, perm: null, flag: "shiftEnabled", section: "Penjualan" },
  { key: "customers", label: "Pelanggan", icon: Users, perm: "sales", section: "Penjualan" },
  { key: "promos", label: "Promo", icon: Tag, perm: "products", section: "Penjualan" },
  { key: "loyalty", label: "Loyalty", icon: Ticket, perm: "products", section: "Penjualan" },
  { key: "staff", label: "Staff", icon: Users, perm: "users", section: "Admin" },
  { key: "audit", label: "Audit", icon: ScrollText, perm: "users", section: "Admin" },
  { key: "settings", label: "Pengaturan", icon: Settings2, perm: "settings", section: "Admin" },
];

export function App() {
  const [route, setRoute] = useState<Route>("till");
  const [moreOpen, setMoreOpen] = useState(false);
  const setProducts = useCatalogStore((s) => s.setProducts);
  const setCategories = useCatalogStore((s) => s.setCategories);
  const staff = useStaffStore((s) => s.staff);
  const settings = useSettingsStore((s) => s.settings);
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

  const visibleNav = NAV.filter(
    (n) =>
      (n.perm === null || !currentUser || currentUser.permissions[n.perm]) &&
      (!n.flag || settings[n.flag]),
  );
  const primaryNav = visibleNav.filter((n) => n.primary);
  const moreNav = visibleNav.filter((n) => !n.primary);
  const onMoreRoute = moreNav.some((n) => n.key === route);

  const go = (key: Route) => {
    setRoute(key);
    setMoreOpen(false);
  };

  const onLogout = () => {
    logout();
    go("till");
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
        <nav className="shrink-0 border-border bg-surface md:w-20 md:border-r">
          {/* Mobile: curated bottom bar (primary items + Lainnya) */}
          <div className="flex items-stretch justify-around border-t border-border md:hidden">
            {primaryNav.map((n) => (
              <NavButton key={n.key} item={n} active={route === n.key} onClick={() => go(n.key)} />
            ))}
            {moreNav.length > 0 && (
              <button
                type="button"
                onClick={() => setMoreOpen(true)}
                aria-current={onMoreRoute ? "page" : undefined}
                className={`flex min-h-[52px] flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-medium transition-colors ${
                  onMoreRoute ? "text-primary" : "text-muted hover:bg-surface-2 hover:text-fg"
                }`}
              >
                <LayoutGrid className="h-5 w-5" strokeWidth={2} />
                Lainnya
              </button>
            )}
          </div>

          {/* Desktop: full vertical rail (scrolls if tall) */}
          <div className="hidden md:flex md:h-full md:flex-col md:py-3">
            <div className="mb-3 flex h-10 w-10 items-center justify-center self-center rounded-xl bg-primary text-on-primary">
              <Store className="h-5 w-5" />
            </div>
            <div className="flex min-h-0 flex-1 flex-col items-center gap-1 overflow-y-auto">
              {visibleNav.map((n) => (
                <NavButton key={n.key} item={n} active={route === n.key} onClick={() => go(n.key)} rail />
              ))}
            </div>
            <div className="mt-2 flex flex-col items-center gap-1 border-t border-border pt-2">
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
          </div>
        </nav>

        <main className="min-h-0 min-w-0 flex-1 overflow-hidden">
          {route === "till" && <TillPage />}
          {route === "dashboard" && <DashboardPage />}
          {route === "catalog" && <CatalogPage />}
          {route === "suppliers" && <SuppliersPage />}
          {route === "purchases" && <PurchaseOrdersPage />}
          {route === "opname" && <OpnamePage />}
          {route === "batches" && <BatchesPage />}
          {route === "reorder" && <ReorderPage />}
          {route === "shift" && <ShiftPage />}
          {route === "customers" && <CustomersPage />}
          {route === "promos" && <PromosPage />}
          {route === "loyalty" && <LoyaltyPage />}
          {route === "sales" && <SalesHistoryPage onResumed={() => setRoute("till")} />}
          {route === "staff" && <StaffPage />}
          {route === "audit" && <AuditPage />}
          {route === "settings" && <SettingsPage />}
        </main>
      </div>

      {/* Mobile "Lainnya" sheet — the remaining menu, grouped by section */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden" role="dialog" aria-label="Menu lainnya">
          <div className="animate-fade-in absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMoreOpen(false)} />
          <div className="animate-pop-in relative max-h-[80dvh] overflow-y-auto rounded-t-2xl border-t border-border bg-surface p-4 pb-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-fg">Menu lainnya</h2>
              <button type="button" onClick={() => setMoreOpen(false)} aria-label="Tutup" className="cursor-pointer text-muted hover:text-fg">
                <X className="h-5 w-5" />
              </button>
            </div>
            {SECTION_ORDER.map((section) => {
              const items = moreNav.filter((n) => n.section === section);
              if (items.length === 0) return null;
              return (
                <div key={section} className="mb-4 last:mb-0">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">{section}</p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {items.map((n) => {
                      const Icon = n.icon;
                      const active = route === n.key;
                      return (
                        <button
                          key={n.key}
                          type="button"
                          onClick={() => go(n.key)}
                          aria-current={active ? "page" : undefined}
                          className={`flex min-h-[68px] flex-col items-center justify-center gap-1.5 rounded-xl border p-2 text-center text-[11px] font-medium transition-colors ${
                            active ? "border-primary bg-primary/10 text-primary" : "border-border text-fg hover:bg-surface-2"
                          }`}
                        >
                          <Icon className="h-5 w-5" strokeWidth={2} />
                          {n.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function NavButton({
  item,
  active,
  onClick,
  rail,
}: {
  item: NavItem;
  active: boolean;
  onClick: () => void;
  rail?: boolean;
}) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={
        rail
          ? `flex w-16 cursor-pointer flex-col items-center gap-1 rounded-lg py-2 text-[11px] font-medium transition-colors ${
              active ? "bg-primary text-on-primary" : "text-muted hover:bg-surface-2 hover:text-fg"
            }`
          : `flex min-h-[52px] flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-medium transition-colors ${
              active ? "text-primary" : "text-muted hover:bg-surface-2 hover:text-fg"
            }`
      }
    >
      <Icon className="h-5 w-5" strokeWidth={2} />
      {item.label}
    </button>
  );
}
