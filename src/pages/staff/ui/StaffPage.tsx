import { useState } from "react";
import { PERMISSION_LABELS, useStaffStore, type Staff, type StaffPermissions } from "@/entities/staff";
import { StaffForm } from "@/features/manage-staff-permission";
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
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">Manajemen Staff</h1>
        <button
          type="button"
          onClick={() => setEditing(null)}
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800"
        >
          + Staff
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-neutral-50 text-left text-neutral-500">
            <tr>
              <th className="px-3 py-2">Nama</th>
              <th className="px-3 py-2">Hak akses</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {staff.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-3 py-8 text-center text-neutral-400">
                  Belum ada staff.
                </td>
              </tr>
            ) : (
              staff.map((m) => (
                <tr key={m.id} className="hover:bg-neutral-50">
                  <td className="px-3 py-2 font-medium">{m.name}</td>
                  <td className="px-3 py-2 text-neutral-600">{grantedList(m.permissions)}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => setEditing(m)}
                      className="text-neutral-500 hover:text-neutral-900"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(m.id)}
                      className="ml-3 text-neutral-400 hover:text-red-600"
                    >
                      Hapus
                    </button>
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
