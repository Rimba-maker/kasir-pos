import { useState } from "react";
import { useSessionStore } from "../model/session";

export function LoginScreen() {
  const login = useSessionStore((s) => s.login);
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!login(name, pin)) setError(true);
  }

  const field = "mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500";

  return (
    <div className="flex h-screen items-center justify-center bg-neutral-50">
      <form onSubmit={submit} className="w-80 space-y-4 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="text-center">
          <h1 className="text-xl font-bold">Kasir POS</h1>
          <p className="text-sm text-neutral-500">Masuk untuk melanjutkan</p>
        </div>
        <label className="block text-sm">
          <span className="text-neutral-600">Nama</span>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(false);
            }}
            className={field}
            autoFocus
          />
        </label>
        <label className="block text-sm">
          <span className="text-neutral-600">PIN</span>
          <input
            type="password"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setError(false);
            }}
            className={field}
            inputMode="numeric"
          />
        </label>
        {error && <p className="text-sm text-red-600">Nama atau PIN salah.</p>}
        <button
          type="submit"
          className="w-full rounded-md bg-neutral-900 py-2.5 font-medium text-white hover:bg-neutral-800"
        >
          Masuk
        </button>
      </form>
    </div>
  );
}
