import { create } from "zustand";
import { useStaffStore, type Staff } from "@/entities/staff";
import { authenticate } from "./authenticate";

interface SessionState {
  currentUser: Staff | null;
  login: (name: string, pin: string) => boolean;
  logout: () => void;
}

/** In-memory session — re-login on app restart (standard for a shared till). */
export const useSessionStore = create<SessionState>((set) => ({
  currentUser: null,
  login: (name, pin) => {
    const user = authenticate(useStaffStore.getState().staff, name, pin);
    if (user) set({ currentUser: user });
    return user !== null;
  },
  logout: () => set({ currentUser: null }),
}));
