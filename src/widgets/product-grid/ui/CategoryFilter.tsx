import type { Category } from "@/entities/product";

interface CategoryFilterProps {
  categories: Category[];
  selected: string | null;
  onSelect: (categoryId: string | null) => void;
}

/** Horizontal chip filter. null = "Semua". */
export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  const chip = (active: boolean) =>
    `cursor-pointer whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-150 ${
      active
        ? "bg-primary text-on-primary"
        : "bg-surface-2 text-muted hover:bg-border hover:text-fg"
    }`;

  return (
    <div className="flex shrink-0 gap-2 overflow-x-auto pb-1">
      <button type="button" className={chip(selected === null)} onClick={() => onSelect(null)}>
        Semua
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          type="button"
          className={chip(selected === c.id)}
          onClick={() => onSelect(c.id)}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
