import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CURRENCY_SYMBOL, DEFAULT_TAX_RATE } from "@/shared/config";
import type { StoreSettings } from "./types";

const defaults: StoreSettings = {
  name: "Kasir POS",
  address: "",
  phone: "",
  currencySymbol: CURRENCY_SYMBOL,
  taxEnabled: false,
  taxRate: DEFAULT_TAX_RATE,
  taxInclusive: false,
  shiftEnabled: false,
  receiptFooter: "Terima kasih telah berbelanja",
  printerTarget: "",
  qrisImagePath: "",
};

interface SettingsState {
  settings: StoreSettings;
  update: (patch: Partial<StoreSettings>) => void;
}

/** Store settings, persisted to localStorage (offline, per-device). */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaults,
      update: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
    }),
    { name: "pos-settings" },
  ),
);
