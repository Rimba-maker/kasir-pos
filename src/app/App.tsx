import { useEffect, useState } from "react";
import { useCatalogStore } from "@/entities/product";
import { TillPage } from "@/pages/till";
import { CatalogPage } from "@/pages/catalog";
import { SalesHistoryPage } from "@/pages/sales-history";
import { StaffPage } from "@/pages/staff";
import { SettingsPage } from "@/pages/settings";
import { categoryApi, productApi, isTauri } from "@/shared/api/pos";
import { demoCategories, demoProducts } from "./demo-data";

type Route = "till" | "catalog" | "sales" | "staff" | "settings";

const NAV: { key: Route; label: string; icon: string }[] = [
  { key: "till", label: "Kasir", icon: "🧾" },
  { key: "catalog", label: "Katalog", icon: "📦" },
  { key: "sales", label: "Riwayat", icon: "📊" },
  { key: "staff", label: "Staff", icon: "👤" },
  { key: "settings", label: "Pengaturan", icon: "⚙️" },
];

export function App() {
  const [route, setRoute] = useState<Route>("till");
  const setProducts = useCatalogStore((s) => s.setProducts);
  const setCategories = useCatalogStore((s) => s.setCategories);

  useEffect(() => {
    if (isTauri()) {
      productApi.list().then(setProducts).catch(() => {});
      categoryApi.list().then(setCategories).catch(() => {});
    } else {
      setCategories(demoCategories);
      setProducts(demoProducts);
    }
  }, [setProducts, setCategories]);

  return (
    <div className="flex h-screen bg-neutral-50 text-neutral-900">
      <nav className="flex w-20 flex-col items-center gap-1 border-r border-neutral-200 bg-white py-3">
        {NAV.map((n) => (
          <button
            key={n.key}
            type="button"
            onClick={() => setRoute(n.key)}
            className={`flex w-16 flex-col items-center gap-1 rounded-lg py-2 text-xs font-medium transition ${
              route === n.key
                ? "bg-neutral-900 text-white"
                : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            <span className="text-lg">{n.icon}</span>
            {n.label}
          </button>
        ))}
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
