import { useState } from "react";
import {
  PERMISSION_LABELS,
  useStaffStore,
  type Staff,
  type StaffPermissions,
} from "@/entities/staff";

const EMPTY_PERMS: StaffPermissions = {
  products: false,
  categories: false,
  sales: false,
  users: false,
  settings: false,
};

interface StaffFormProps {
  staff: Staff | null;
  onDone: () => void;
}

export function StaffForm({ staff, onDone }: StaffFormProps) {
  const upsert = useStaffStore((s) => s.upsert);
  const [name, setName] = useState(staff?.name ?? "");
  const [pin, setPin] = useState(staff?.pin ?? "");
  const [perms, setPerms] = useState<StaffPermissions>(staff?.permissions ?? EMPTY_PERMS);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    upsert({
      id: staff?.id ?? crypto.randomUUID(),
      name: name.trim(),
      pin: pin.trim(),
      permissions: perms,
    });
    onDone();
  }

  const field = "mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500";

  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block text-sm">
        <span className="text-neutral-600">Nama</span>
        <input value={name} onChange={(e) => setName(e.target.value)} className={field} autoFocus />
      </label>
      <label className="block text-sm">
        <span className="text-neutral-600">PIN</span>
        <input value={pin} onChange={(e) => setPin(e.target.value)} className={field} inputMode="numeric" />
      </label>

      <fieldset className="space-y-2">
        <legend className="text-sm text-neutral-600">Hak akses</legend>
        {(Object.keys(PERMISSION_LABELS) as (keyof StaffPermissions)[]).map((key) => (
          <label key={key} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={perms[key]}
              onChange={(e) => setPerms((p) => ({ ...p, [key]: e.target.checked }))}
            />
            {PERMISSION_LABELS[key]}
          </label>
        ))}
      </fieldset>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onDone}
          className="flex-1 rounded-md border border-neutral-300 py-2 font-medium hover:bg-neutral-100"
        >
          Batal
        </button>
        <button
          type="submit"
          className="flex-1 rounded-md bg-neutral-900 py-2 font-medium text-white hover:bg-neutral-800"
        >
          Simpan
        </button>
      </div>
    </form>
  );
}
