import { useState } from "react";
import {
  PERMISSION_LABELS,
  useStaffStore,
  type Staff,
  type StaffPermissions,
} from "@/entities/staff";
import { Button } from "@/shared/ui/Button";

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

  const field =
    "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg outline-none focus:border-primary";

  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block text-sm">
        <span className="text-muted">Nama</span>
        <input value={name} onChange={(e) => setName(e.target.value)} className={field} autoFocus />
      </label>
      <label className="block text-sm">
        <span className="text-muted">PIN</span>
        <input value={pin} onChange={(e) => setPin(e.target.value)} className={field} inputMode="numeric" />
      </label>

      <fieldset className="space-y-2">
        <legend className="text-sm text-muted">Hak akses</legend>
        {(Object.keys(PERMISSION_LABELS) as (keyof StaffPermissions)[]).map((key) => (
          <label key={key} className="flex items-center gap-2 text-sm text-fg">
            <input
              type="checkbox"
              checked={perms[key]}
              onChange={(e) => setPerms((p) => ({ ...p, [key]: e.target.checked }))}
              className="accent-[var(--color-primary)]"
            />
            {PERMISSION_LABELS[key]}
          </label>
        ))}
      </fieldset>

      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={onDone} className="flex-1">
          Batal
        </Button>
        <Button type="submit" variant="primary" className="flex-1">
          Simpan
        </Button>
      </div>
    </form>
  );
}
