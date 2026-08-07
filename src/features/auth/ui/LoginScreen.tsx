import { useState } from "react";
import { Store } from "lucide-react";
import { Button } from "@/shared/ui/Button";
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

  const field =
    "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-fg outline-none focus:border-primary";

  return (
    <div className="flex h-screen items-center justify-center bg-bg p-4">
      <form
        onSubmit={submit}
        className="animate-pop-in w-80 space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-xl"
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-on-primary">
            <Store className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-fg">Kasir POS</h1>
          <p className="text-sm text-muted">Masuk untuk melanjutkan</p>
        </div>
        <label className="block text-sm">
          <span className="text-muted">Nama</span>
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
          <span className="text-muted">PIN</span>
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
        {error && <p className="text-sm text-danger">Nama atau PIN salah.</p>}
        <Button type="submit" variant="primary" size="lg" className="w-full">
          Masuk
        </Button>
      </form>
    </div>
  );
}
