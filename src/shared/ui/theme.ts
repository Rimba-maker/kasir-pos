import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

function apply(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
}

interface ThemeState {
  theme: Theme;
  setTheme: (t: Theme) => void;
  cycle: () => void;
}

const ORDER: Theme[] = ["light", "dark", "system"];

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "system",
      setTheme: (theme) => {
        apply(theme);
        set({ theme });
      },
      cycle: () => {
        const next = ORDER[(ORDER.indexOf(get().theme) + 1) % ORDER.length];
        apply(next);
        set({ theme: next });
      },
    }),
    {
      name: "pos-theme",
      onRehydrateStorage: () => (state) => {
        if (state) apply(state.theme);
      },
    },
  ),
);
