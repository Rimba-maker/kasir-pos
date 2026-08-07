import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useCustomerStore } from "@/entities/customer";
import { useCartStore } from "@/entities/transaction";

/** Attach a customer to the current sale: pick existing or quick-add a new one. */
export function CustomerSelect() {
  const customers = useCustomerStore((s) => s.customers);
  const upsert = useCustomerStore((s) => s.upsert);
  const customerId = useCartStore((s) => s.customerId);
  const setCustomer = useCartStore((s) => s.setCustomer);

  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const input =
    "min-w-0 rounded-md border border-border bg-surface px-2 py-1.5 text-sm text-fg outline-none focus:border-primary";

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const id = crypto.randomUUID();
    upsert({ id, name: name.trim(), phone: phone.trim() || null });
    setCustomer(id);
    setName("");
    setPhone("");
    setAdding(false);
  }

  if (adding) {
    return (
      <form onSubmit={save} className="flex flex-wrap items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama pelanggan"
          className={`flex-1 ${input}`}
          autoFocus
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="No. HP"
          inputMode="tel"
          className={`w-28 ${input}`}
        />
        <button
          type="submit"
          className="cursor-pointer rounded-md bg-primary px-2.5 py-1.5 text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover"
        >
          Simpan
        </button>
        <button
          type="button"
          onClick={() => setAdding(false)}
          className="cursor-pointer text-sm text-muted transition-colors hover:text-fg"
        >
          Batal
        </button>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={customerId ?? ""}
        onChange={(e) => setCustomer(e.target.value || null)}
        className={`flex-1 ${input}`}
      >
        <option value="">Pelanggan umum</option>
        {customers.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
            {c.phone ? ` — ${c.phone}` : ""}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => setAdding(true)}
        className="flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-md border border-border px-2.5 py-1.5 text-sm text-fg transition-colors hover:bg-surface-2"
      >
        <UserPlus className="h-4 w-4" />
        Baru
      </button>
    </div>
  );
}
