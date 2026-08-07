# FSD Structure — POS Offline (Tauri + React)

Mengikuti Feature-Sliced Design + Open/Closed Principle: fitur baru = folder/file baru, bukan modifikasi core.

```
src/
├── app/                          # App-level setup (providers, routing, global styles)
│   ├── providers/
│   ├── styles/
│   └── App.tsx
│
├── pages/                        # Komposisi halaman (compose widgets + features)
│   ├── till/                     # Halaman kasir utama
│   ├── catalog/                  # Halaman manajemen produk
│   ├── sales-history/            # Halaman riwayat transaksi
│   ├── staff/                    # Halaman manajemen staff
│   └── settings/                 # Halaman pengaturan toko
│
├── widgets/                      # Kombinasi beberapa feature jadi 1 blok UI
│   ├── cart-panel/                # Cart + kontrol qty + diskon + tax (compose dari features)
│   ├── product-grid/              # Product tiles + filter kategori (compose dari features)
│   └── receipt-preview/           # Preview struk sebelum cetak
│
├── features/                     # 1 folder = 1 aksi bisnis spesifik
│   ├── add-to-cart/
│   ├── apply-discount/
│   ├── hold-resume-sale/
│   ├── pay-cash/                  # Payment pad + kalkulasi kembalian
│   ├── pay-qris-static/           # Tampilkan nominal + tombol konfirmasi manual
│   ├── print-receipt/             # Trigger cetak via Tauri command (hardware layer)
│   ├── manage-product/            # CRUD produk
│   ├── manage-category/
│   ├── filter-transactions/       # Filter riwayat by tanggal/kasir/status
│   ├── manage-staff-permission/
│   └── quick-add-customer/
│
├── entities/                     # Domain model + tampilan dasarnya (business entity)
│   ├── product/
│   │   ├── model/                 # types, store (Zustand slice)
│   │   └── ui/                    # ProductCard, StockBadge
│   ├── transaction/
│   │   ├── model/
│   │   └── ui/
│   ├── customer/
│   ├── staff/
│   └── store-settings/
│
├── shared/                       # Reusable, ga tau apa-apa soal business logic
│   ├── ui/                        # Shadcn components wrapper
│   ├── lib/                       # utils (currency formatter, date, dll)
│   ├── api/                       # Wrapper Tauri invoke() calls
│   └── config/                    # constants
│
└── main.tsx

src-tauri/                        # Rust backend (Tauri)
├── src/
│   ├── commands/                  # 1 file = 1 domain command group
│   │   ├── transaction.rs         # create_transaction, hold_transaction, dll
│   │   ├── product.rs             # CRUD produk
│   │   ├── printer.rs             # ESC/POS print commands
│   │   ├── auth.rs                # staff login lokal
│   │   └── settings.rs
│   ├── db/
│   │   ├── mod.rs                 # koneksi SQLite
│   │   ├── schema.rs              # migration/schema
│   │   └── repositories/          # 1 file per entity (product_repo.rs, dll)
│   ├── hardware/
│   │   └── escpos.rs              # printer driver layer
│   └── main.rs
└── Cargo.toml
```

## Prinsip penerapan Open/Closed di struktur ini

- **Nambah fitur baru** (misal: fitur promo diskon kompleks di fase 2) → bikin folder baru di `features/apply-promo/`, JANGAN edit `features/apply-discount/` yang udah ada
- **Nambah payment method baru** (misal: nanti QRIS terintegrasi) → bikin `features/pay-qris-gateway/` baru, `pay-qris-static/` yang lama tetap utuh sebagai fallback/opsi
- **Nambah command Rust baru** → tambah file baru di `commands/`, jangan numpuk semua command di 1 file besar
- **Cloud sync (fase 2)** → nanti masuk sebagai `features/cloud-sync/` + `src-tauri/src/sync/` folder terpisah — tidak menyentuh `db/repositories/` yang sudah ada, cukup "membaca" dari situ

## Urutan build yang disarankan (MVP)

1. `entities/product` + `entities/transaction` (model dasar dulu)
2. `src-tauri/db` — schema SQLite + repository layer
3. `features/add-to-cart` + `widgets/cart-panel` + `widgets/product-grid`
4. `features/pay-cash` (paling simpel, ga ada dependency luar)
5. `features/print-receipt` (baru sentuh hardware layer)
6. `features/pay-qris-static`
7. `pages/till` — compose semua di atas jadi halaman utuh
8. Baru lanjut ke `catalog`, `sales-history`, `staff`, `settings`
