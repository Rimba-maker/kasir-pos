# PRD — POS Offline-First (MVP)

## 1. Latar Belakang & Tujuan

Aplikasi kasir (POS) desktop yang **berjalan 100% offline** — tanpa dependency internet, tanpa biaya langganan cloud. Target awal: generic usaha kecil (retail maupun F&B ringan) di Indonesia. Fase ini fokus ship MVP yang solid; cloud sync/backup masuk sebagai fitur lanjutan di fase berikutnya, bukan bagian dari arsitektur inti sekarang.

**Prinsip desain:**
- Offline-first — semua fitur core harus tetap jalan tanpa internet
- Zero recurring cost — tidak ada biaya API/cloud provider berbayar di MVP
- Generic core — fitur universal dulu, ekstensi vertikal (F&B/retail spesifik) menyusul di fase 2
- FSD + Open/Closed — fitur baru = folder/file baru, minim modifikasi ke kode existing

## 2. Target Pengguna

Pemilik usaha kecil (UMKM) dengan 1 lokasi fisik, 1 atau beberapa kasir dalam device yang sama atau jaringan lokal (LAN) yang sama.

## 3. Scope MVP

### 3.1 Till (Transaksi Kasir)
- Barcode scan / cari produk (Enter untuk tambah ke cart)
- Filter kategori (chip filter)
- Product tile: foto, harga, status stok
- Cart: kontrol quantity, diskon per item/transaksi, pajak (opsional, on/off di settings)
- Hold / resume transaksi (transaksi bisa dipause, dilanjut nanti)
- Metode pembayaran:
  - **Cash** — payment pad dengan shortcut nominal (mirip contoh: Rp10rb–Rp100rb + Exact), otomatis hitung kembalian
  - **QRIS statis (manual confirm)** — app tampilkan nominal, kasir konfirmasi manual setelah cek notifikasi pembayaran masuk
- Cetak struk (thermal printer via USB/Bluetooth lokal)

### 3.2 Catalog (Manajemen Produk)
- CRUD produk & kategori
- Tracking stok (otomatis berkurang saat transaksi)
- Upload foto produk (lokal — **tanpa** fitur ambil foto dari API eksternal seperti Pexels, supaya tetap offline murni; foto placeholder default kalau kosong)
- Seed data demo (contoh katalog buat testing/demo)
- Bulk actions (multi-select delete)

### 3.3 Sales (Riwayat & Laporan)
- Riwayat transaksi — filter by tanggal, kasir, status (paid/held)
- Laporan ringkas: omzet harian, produk terlaris (dihitung lokal dari SQLite)

### 3.4 Staff & Customer
- Akun staff dengan permission flag (siapa boleh akses: produk, kategori, sales, users, settings)
- Data customer dasar (nama, kontak) — opsional, quick-add saat transaksi

### 3.5 Settings
- Identitas toko (nama, alamat, kontak, logo, footer struk)
- Simbol currency, pajak opsional
- Operating mode: **Standalone** (1 device) — mode Network Server/Terminal masuk pertimbangan fase 2 kalau multi-kasir LAN dibutuhkan
- Konfigurasi printer/till

## 4. Out of Scope (Fase 2+)

- Cloud sync / backup otomatis (next feature — akan didesain supaya "gampang di-plug" tanpa ubah core, bukan wajib setup di awal)
- QRIS terintegrasi via payment gateway (Midtrans/Xendit) — ada MDR fee, butuh internet real-time
- Multi-cabang beda lokasi
- Modifier/varian produk kompleks (relevan buat F&B — resep, opsi tambahan)
- Kitchen display / manajemen meja
- Network Server/Terminal mode (multi-device dalam 1 LAN)
- Integrasi Pexels/API foto eksternal

## 5. Known Limitations (MVP)

- QRIS konfirmasi manual — rely ke ketelitian kasir, bukan verifikasi otomatis. Risiko human error dicatat, mitigasi via notifikasi jelas di UI ("Menunggu Konfirmasi Kasir").
- Data hanya tersimpan di 1 device (standalone) — belum ada backup otomatis. Rekomendasi: fitur export manual (backup ke file) masuk MVP sebagai jaring pengaman minimal.

## 6. Tech Stack (ringkas)

| Layer | Pilihan |
|---|---|
| Runtime | Tauri (Rust) |
| Frontend | React + Vite |
| UI | Shadcn UI + Tailwind CSS |
| State | Zustand |
| Database | SQLite (lokal, via `rusqlite`) |
| Printer | ESC/POS via Rust crate |
| Arsitektur kode | Feature-Sliced Design + Open/Closed |

## 7. Metrik Sukses MVP

- Transaksi end-to-end (pilih produk → bayar cash/QRIS → cetak struk) berjalan tanpa internet
- Stok otomatis update real-time setelah transaksi
- Laporan omzet harian akurat dari data lokal
- Zero recurring cost — tidak ada tagihan bulanan API/cloud di tahap ini
