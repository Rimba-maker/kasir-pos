import { Monitor, Moon, Sun } from "lucide-react";
import { useThemeStore, type Theme } from "./theme";

const ICON: Record<Theme, typeof Sun> = { light: Sun, dark: Moon, system: Monitor };
const LABEL: Record<Theme, string> = { light: "Terang", dark: "Gelap", system: "Sistem" };

/** Cycles light → dark → system. */
export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const cycle = useThemeStore((s) => s.cycle);
  const Icon = ICON[theme];

  return (
    <button
      type="button"
      onClick={cycle}
      title={`Tema: ${LABEL[theme]}`}
      aria-label={`Ganti tema (sekarang: ${LABEL[theme]})`}
      className="flex w-16 cursor-pointer flex-col items-center gap-1 rounded-lg py-2 text-[11px] font-medium text-muted transition-colors hover:bg-surface-2 hover:text-fg"
    >
      <Icon className="h-5 w-5" strokeWidth={2} />
      {LABEL[theme]}
    </button>
  );
}
