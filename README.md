# Kasir POS

Aplikasi **Point of Sale (POS) offline-first** untuk UMKM Indonesia — berjalan
100% tanpa internet, tanpa biaya langganan. Dibangun dengan **Tauri (Rust) + React**.

## Fitur

**Kasir & penjualan**
- Cari/scan barcode, filter kategori, keranjang, diskon, pajak (PPN inclusive/exclusive)
- Pembayaran tunai — **pecahan Rupiah asli (uang kertas + koin), ditekan bertambah** untuk uang non-pas + kembalian; QRIS statis; **jual tempo (piutang)**
- **Promo otomatis** (diskon %, nominal, grosir-qty, bundle, beli-X-gratis-Y)
- Hold / resume transaksi · cetak struk thermal (ESC/POS)
- **Shift kasir** — buka/tutup + rekonsiliasi kas (opsional)

**Katalog & inventaris**
- CRUD produk & kategori, foto, bulk delete, **import/export Excel**
- Multi-harga per tier (umum/grosir), harga beli, **multi-satuan** (pcs/box/kg)
- **Varian produk + SKU** — satu produk banyak varian (ukuran/warna), tiap varian punya harga, stok & SKU sendiri
- **Stock ledger** (riwayat mutasi), **stok opname**, **batch/expiry (FEFO)**, **produk paket/kit**
- **Reorder point** + notif stok menipis + saran draft PO

**Pembelian & keuangan**
- **Supplier** + hutang + aging, **Purchase Order** + terima barang (parsial) + **retur**
- **Piutang pelanggan** + aging + pembayaran cicil

**Pelanggan & loyalty**
- Master pelanggan (tier harga, segmen), **poin + tier member + voucher**

**Laporan & admin**
- **Dashboard** — KPI (omzet, laba kotor, rata-rata/transaksi), tren omzet & laba, donut metode bayar, jam ramai, produk terlaris + export PDF
- Riwayat transaksi, staff **RBAC** (role preset) + **audit log**
- **Backup** ekspor/impor JSON (semua modul)
- **Responsif** — nav mobile ringkas (menu utama + sheet "Lainnya"), keranjang bottom-sheet, tema terang/gelap

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
| State | Zustand 5 (persist localStorage) |
| Charts | Recharts |
| Export | SheetJS (xlsx) · jsPDF |
| Database | SQLite (`rusqlite`) |
| Printer | ESC/POS |

## Test

```bash
pnpm test
```
