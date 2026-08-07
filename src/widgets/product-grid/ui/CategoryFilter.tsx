import type { Category } from "@/entities/product";

interface CategoryFilterProps {
  categories: Category[];
  selected: string | null;
  onSelect: (categoryId: string | null) => void;
}

/** Horizontal chip filter. null = "Semua". */
export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  const chip = (active: boolean) =>
    `whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium transition ${
      active
        ? "bg-neutral-900 text-white"
        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
    }`;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
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
