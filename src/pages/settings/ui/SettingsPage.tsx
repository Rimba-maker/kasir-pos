import { useSettingsStore } from "@/entities/store-settings";

export function SettingsPage() {
  const settings = useSettingsStore((s) => s.settings);
  const update = useSettingsStore((s) => s.update);

  const field = "mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500";

  return (
    <div className="h-full overflow-auto p-4">
      <h1 className="mb-4 text-lg font-bold">Pengaturan Toko</h1>

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
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.taxEnabled}
              onChange={(e) => update({ taxEnabled: e.target.checked })}
            />
            Aktifkan pajak
          </label>
          {settings.taxEnabled && (
            <label className="block text-sm">
              <span className="text-neutral-600">Tarif pajak (%)</span>
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

        <p className="text-xs text-neutral-400">Perubahan tersimpan otomatis di perangkat ini.</p>
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
        <span className="text-neutral-600">{label}</span>
        <input value={value} onChange={(e) => onChange(e.target.value)} className={field} />
      </label>
    );
  }
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-lg border border-neutral-200 bg-white p-4">
      <h2 className="font-semibold">{title}</h2>
      {children}
    </section>
  );
}
