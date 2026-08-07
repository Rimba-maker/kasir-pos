import { Download } from "lucide-react";
import { useSettingsStore } from "@/entities/store-settings";
import { downloadBackup } from "@/features/export-backup";
import { Button } from "@/shared/ui/Button";

export function SettingsPage() {
  const settings = useSettingsStore((s) => s.settings);
  const update = useSettingsStore((s) => s.update);

  const field =
    "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg outline-none focus:border-primary";

  return (
    <div className="h-full overflow-auto p-5">
      <h1 className="mb-4 text-xl font-bold text-fg">Pengaturan Toko</h1>

      <div className="max-w-lg space-y-5">
        <Section title="Identitas Toko">
          <Text label="Nama toko" value={settings.name} onChange={(v) => update({ name: v })} />
          <Text label="Alamat" value={settings.address} onChange={(v) => update({ address: v })} />
          <Text label="Telepon" value={settings.phone} onChange={(v) => update({ phone: v })} />
          <Text
            label="Footer struk"
            value={settings.receiptFooter}
            onChange={(v) => update({ receiptFooter: v })}
          />
        </Section>

        <Section title="Pajak & Mata Uang">
          <Text
            label="Simbol mata uang"
            value={settings.currencySymbol}
            onChange={(v) => update({ currencySymbol: v })}
          />
          <label className="flex items-center gap-2 text-sm text-fg">
            <input
              type="checkbox"
              checked={settings.taxEnabled}
              onChange={(e) => update({ taxEnabled: e.target.checked })}
              className="accent-[var(--color-primary)]"
            />
            Aktifkan pajak
          </label>
          {settings.taxEnabled && (
            <label className="block text-sm">
              <span className="text-muted">Tarif pajak (%)</span>
              <input
                type="number"
                min={0}
                max={100}
                value={Math.round(settings.taxRate * 100)}
                onChange={(e) => update({ taxRate: (Number(e.target.value) || 0) / 100 })}
                className={field}
              />
            </label>
          )}
        </Section>

        <Section title="Perangkat">
          <Text
            label="Target printer (device / share path)"
            value={settings.printerTarget}
            onChange={(v) => update({ printerTarget: v })}
          />
          <Text
            label="Path gambar QRIS statis"
            value={settings.qrisImagePath}
            onChange={(v) => update({ qrisImagePath: v })}
          />
        </Section>

        <Section title="Backup Data">
          <p className="text-sm text-muted">
            Ekspor seluruh data (produk, transaksi, pelanggan, staff, pengaturan) ke satu file
            JSON sebagai cadangan manual.
          </p>
          <Button variant="primary" size="sm" onClick={() => void downloadBackup()}>
            <Download className="h-4 w-4" />
            Ekspor Backup (.json)
          </Button>
        </Section>

        <p className="text-xs text-muted">Perubahan tersimpan otomatis di perangkat ini.</p>
      </div>
    </div>
  );

  function Text({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
  }) {
    return (
      <label className="block text-sm">
        <span className="text-muted">{label}</span>
        <input value={value} onChange={(e) => onChange(e.target.value)} className={field} />
      </label>
    );
  }
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-xl border border-border bg-surface p-4">
      <h2 className="font-semibold text-fg">{title}</h2>
      {children}
    </section>
  );
}
