import { ScrollText } from "lucide-react";
import { useAuditStore } from "@/entities/audit";

export function AuditPage() {
  const logs = useAuditStore((s) => s.logs);

  return (
    <div className="h-full overflow-auto p-4 sm:p-5">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-fg">Audit Log</h1>
        <p className="text-sm text-muted">Jejak aksi sensitif (disimpan {logs.length} terbaru).</p>
      </div>

      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-16 text-muted">
          <ScrollText className="h-10 w-10" strokeWidth={1.5} />
          <p className="text-sm">Belum ada aktivitas tercatat.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="bg-surface-2 text-left text-muted">
              <tr>
                <th className="px-3 py-2.5 font-medium">Waktu</th>
                <th className="px-3 py-2.5 font-medium">Aksi</th>
                <th className="px-3 py-2.5 font-medium">Entitas</th>
                <th className="px-3 py-2.5 font-medium">Detail</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-t border-border">
                  <td className="px-3 py-2.5 text-muted">{new Date(l.at).toLocaleString("id-ID")}</td>
                  <td className="px-3 py-2.5 font-medium text-fg">{l.action}</td>
                  <td className="px-3 py-2.5 text-muted">
                    {l.entity}
                    {l.entityId ? ` · ${l.entityId.slice(0, 8)}` : ""}
                  </td>
                  <td className="px-3 py-2.5 text-muted">
                    {l.after ? JSON.stringify(l.after) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
