import { useEffect } from "react";
import { useCatalogStore } from "@/entities/product";
import { TillPage } from "@/pages/till";
import { productApi, isTauri } from "@/shared/api/pos";
import { demoCategories, demoProducts } from "./demo-data";

export function App() {
  const setProducts = useCatalogStore((s) => s.setProducts);
  const setCategories = useCatalogStore((s) => s.setCategories);

  useEffect(() => {
    if (isTauri()) {
      productApi.list().then(setProducts).catch(() => {});
    } else {
      setCategories(demoCategories);
      setProducts(demoProducts);
    }
  }, [setProducts, setCategories]);

  return <TillPage />;
}
