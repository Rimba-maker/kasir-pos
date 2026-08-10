# Kasir POS

POS (Point of Sale) **offline-first** untuk UMKM Indonesia — desktop app yang berjalan
100% tanpa internet, tanpa biaya langganan. Dibangun dengan **Tauri (Rust) + React**.

> Spec produk & arsitektur: [`POS-PRD.md`](./POS-PRD.md) · [`POS-FSD-structure.md`](./POS-FSD-structure.md)

## Status

| Bagian | Status |
|---|---|
| Frontend (React) | ✅ berjalan penuh — di browser via demo data |
| Alur kasir, katalog, laporan, staff, settings, backup | ✅ selesai, teruji (26 test) |
| Design system (tema teal/orange, dark mode) | ✅ selesai |
| Backend desktop (Tauri/Rust + SQLite + printer) | ⏳ kode ditulis, **butuh Rust** untuk dikompilasi ([`src-tauri/README.md`](./src-tauri/README.md)) |

Build hijau: `tsc` strict + `vite build` + 26 unit test (vitest).

## Menjalankan

### Mode browser (paling cepat — pakai data demo)

```bash
./init.sh          # pnpm install + verifikasi (atau: pnpm install)
pnpm dev           # buka http://localhost:1420
```

### Mode desktop (Tauri asli — SQLite + printer)

Butuh **Rust** + **MSVC C++ build tools** dulu. Lihat [`src-tauri/README.md`](./src-tauri/README.md).

```bash
pnpm tauri dev
```

## Fitur (MVP)

- **Kasir**: cari/scan barcode, filter kategori, keranjang, diskon, pajak opsional
- **Pembayaran**: tunai (dengan shortcut nominal + kembalian) & QRIS statis (konfirmasi manual)
- **Struk**: cetak thermal ESC/POS
- **Hold / resume** transaksi
- **Katalog**: CRUD produk & kategori, foto produk (diproses lokal), bulk delete
- **Laporan**: riwayat + filter tanggal/status, omzet, produk terlaris
- **Staff**: login PIN + hak akses per menu
- **Settings**: identitas toko, pajak, target printer
- **Backup**: ekspor seluruh data ke JSON

## Tech stack (aktual)

| Layer | Pilihan |
|---|---|
| Runtime | Tauri v2 (Rust) |
| Frontend | React 18 + Vite 6 + TypeScript (strict) |
| UI | Design system custom di atas **Tailwind CSS v4** (token + dark mode) |
| State | Zustand 5 (SQLite untuk produk/transaksi; localStorage untuk staff/customer/settings) |
| Database | SQLite via `rusqlite` (bundled) |
| Printer | ESC/POS **ditulis tangan** (byte protocol, tanpa crate) |
| Arsitektur | Feature-Sliced Design (FSD) + Open/Closed |
| Test | vitest 3 (logika murni) |

> Catatan: PRD awal menyebut Shadcn UI & ESC/POS via crate; implementasi memilih
> design system Tailwind v4 sendiri + ESC/POS tangan agar lebih ringan & bebas dependency.

## Struktur (FSD)

```
src/
├── app/         # shell, styling, routing, demo data
├── pages/       # till, catalog, sales-history, staff, settings
├── widgets/     # cart-panel, product-grid, receipt-preview
├── features/    # add-to-cart, pay-cash, pay-qris, print-receipt, manage-*, auth, ...
├── entities/    # product, transaction, customer, staff, store-settings
└── shared/      # ui primitives, lib, config, api
src-tauri/       # backend Rust (Tauri commands, SQLite, ESC/POS)
```

## Harness

Repo ini ditata sebagai **agent harness** (lihat [`CLAUDE.md`](./CLAUDE.md) & [`AGENTS.md`](./AGENTS.md)):

| Subsistem | Artefak |
|---|---|
| Instructions | `AGENTS.md`, `CLAUDE.md` |
| Environment | `init.sh` |
| State | `claude-progress.md`, `feature_list.json` |
| Feedback | `verify.sh` (build + test — gate "selesai") |

```bash
sh verify.sh       # jalankan gate: tidak "selesai" sampai ini exit 0
```

## Dokumen

- [`POS-PRD.md`](./POS-PRD.md) — product requirements
- [`POS-FSD-structure.md`](./POS-FSD-structure.md) — arsitektur & urutan build
- [`CLAUDE.md`](./CLAUDE.md) / [`AGENTS.md`](./AGENTS.md) — instruksi agent + harness
- [`claude-progress.md`](./claude-progress.md) — log sesi
- [`feature_list.json`](./feature_list.json) — status per fitur
- [`src-tauri/README.md`](./src-tauri/README.md) — backend Rust
