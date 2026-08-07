import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { PERMISSION_LABELS, useStaffStore, type Staff, type StaffPermissions } from "@/entities/staff";
import { StaffForm } from "@/features/manage-staff-permission";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";

export function StaffPage() {
  const staff = useStaffStore((s) => s.staff);
  const remove = useStaffStore((s) => s.remove);
  const [editing, setEditing] = useState<Staff | null | undefined>(undefined);

  const grantedList = (perms: StaffPermissions) =>
    (Object.keys(PERMISSION_LABELS) as (keyof StaffPermissions)[])
      .filter((k) => perms[k])
      .map((k) => PERMISSION_LABELS[k])
      .join(", ") || "—";

  return (
    <div className="flex h-full flex-col gap-4 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-fg">Manajemen Staff</h1>
          <p className="text-sm text-muted">{staff.length} akun</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setEditing(null)}>
          <Plus className="h-4 w-4" />
          Staff
        </Button>
      </div>

      {staff.length === 0 && (
        <p className="rounded-lg border border-dashed border-border bg-surface p-3 text-sm text-muted">
          Belum ada staff — selama kosong, aplikasi terbuka tanpa login. Tambahkan staff untuk
          mengaktifkan login &amp; hak akses.
        </p>
      )}

      <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-surface-2 text-left text-muted">
            <tr>
              <th className="px-3 py-2.5 font-medium">Nama</th>
              <th className="px-3 py-2.5 font-medium">Hak akses</th>
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {staff.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-3 py-10 text-center text-muted">
                  Belum ada staff.
                </td>
              </tr>
            ) : (
              staff.map((m) => (
                <tr key={m.id} className="transition-colors hover:bg-surface-2/60">
                  <td className="px-3 py-2.5 font-medium text-fg">{m.name}</td>
                  <td className="px-3 py-2.5 text-muted">{grantedList(m.permissions)}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setEditing(m)}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-fg"
                        aria-label={`Edit ${m.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(m.id)}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger-bg hover:text-danger"
                        aria-label={`Hapus ${m.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={editing !== undefined}
        title={editing ? "Edit Staff" : "Staff Baru"}
        onClose={() => setEditing(undefined)}
      >
        {editing !== undefined && <StaffForm staff={editing} onDone={() => setEditing(undefined)} />}
      </Modal>
    </div>
  );
}
