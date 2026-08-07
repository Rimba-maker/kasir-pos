import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Staff } from "./types";

interface StaffState {
  staff: Staff[];
  upsert: (member: Staff) => void;
  remove: (id: string) => void;
}

/** Staff accounts, persisted to localStorage (offline, per-device). */
export const useStaffStore = create<StaffState>()(
  persist(
    (set) => ({
      staff: [],
      upsert: (member) =>
        set((s) => {
          const i = s.staff.findIndex((m) => m.id === member.id);
          if (i === -1) return { staff: [...s.staff, member] };
          const next = s.staff.slice();
          next[i] = member;
          return { staff: next };
        }),
      remove: (id) => set((s) => ({ staff: s.staff.filter((m) => m.id !== id) })),
    }),
    { name: "pos-staff" },
  ),
);
