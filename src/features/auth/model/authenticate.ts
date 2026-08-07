import type { Staff } from "@/entities/staff";

/** Match a staff member by name (case-insensitive) and exact PIN. */
export function authenticate(staff: Staff[], name: string, pin: string): Staff | null {
  const n = name.trim().toLowerCase();
  const p = pin.trim();
  return staff.find((s) => s.name.toLowerCase() === n && s.pin === p) ?? null;
}
