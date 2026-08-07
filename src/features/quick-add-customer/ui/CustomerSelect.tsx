import { useState } from "react";
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
          className="min-w-0 flex-1 rounded-md border border-neutral-300 px-2 py-1 text-sm outline-none focus:border-neutral-500"
          autoFocus
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="No. HP"
          inputMode="tel"
          className="w-28 rounded-md border border-neutral-300 px-2 py-1 text-sm outline-none focus:border-neutral-500"
        />
        <button type="submit" className="rounded-md bg-neutral-900 px-2 py-1 text-sm text-white">
          Simpan
        </button>
        <button
          type="button"
          onClick={() => setAdding(false)}
          className="text-sm text-neutral-500 hover:text-neutral-800"
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
        className="min-w-0 flex-1 rounded-md border border-neutral-300 px-2 py-1 text-sm outline-none focus:border-neutral-500"
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
        className="whitespace-nowrap rounded-md border border-neutral-300 px-2 py-1 text-sm hover:bg-neutral-100"
      >
        + Baru
      </button>
    </div>
  );
}
