import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuditLog } from "./types";

/** Retention cap — audit log is a bounded ring buffer (offline localStorage). */
export const AUDIT_MAX = 500;

/** Keep only the newest `max` entries. */
export function capLogs(logs: AuditLog[], max: number): AuditLog[] {
  return logs.slice(0, max);
}

interface AuditState {
  logs: AuditLog[];
  log: (entry: AuditLog) => void;
}

export const useAuditStore = create<AuditState>()(
  persist(
    (set) => ({
      logs: [],
      log: (entry) => set((s) => ({ logs: capLogs([entry, ...s.logs], AUDIT_MAX) })),
    }),
    { name: "pos-audit" },
  ),
);

/** Record a sensitive action (before/after optional). */
export function logAudit(entry: Omit<AuditLog, "id" | "at">): void {
  useAuditStore.getState().log({ ...entry, id: crypto.randomUUID(), at: new Date().toISOString() });
}
