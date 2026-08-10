# Kasir POS

Aplikasi **Point of Sale (POS) offline-first** untuk UMKM Indonesia — berjalan
100% tanpa internet, tanpa biaya langganan. Dibangun dengan **Tauri (Rust) + React**.

## Fitur

- **Kasir**: cari/scan barcode, filter kategori, keranjang, diskon, pajak opsional
- **Pembayaran**: tunai (shortcut nominal + kembalian) & QRIS statis
- **Struk**: cetak thermal (ESC/POS)
- **Hold / resume** transaksi
- **Katalog**: CRUD produk & kategori, foto produk, bulk delete
- **Laporan**: riwayat transaksi, omzet, produk terlaris
- **Staff**: login PIN + hak akses per menu
- **Backup**: ekspor data ke JSON
- **Responsif** + tema terang/gelap

## Menjalankan

### Mode browser (preview cepat)

```bash
pnpm install
pnpm dev            # http://localhost:1420
```

### Mode desktop (SQLite + printer)

Butuh **Rust** (rustup) + **MSVC C++ build tools**.

```bash
pnpm tauri dev      # dev
pnpm tauri build    # bundle installer
```

## Stack

| Layer | Pilihan |
|---|---|
| Runtime | Tauri v2 (Rust) |
| Frontend | React 18 + Vite 6 + TypeScript |
| UI | Tailwind CSS v4 |
| State | Zustand 5 |
| Database | SQLite (`rusqlite`) |
| Printer | ESC/POS |

## Test

```bash
pnpm test
```
