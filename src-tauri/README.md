# src-tauri — Rust backend

SQLite (via `rusqlite`, bundled) + Tauri v2 command layer.

## Prasyarat menjalankan (belum terpasang di mesin ini)

1. **Rust toolchain** — install via <https://rustup.rs>.
2. **C build tools** — `rusqlite` fitur `bundled` mengcompile SQLite dari source:
   - Windows: "Desktop development with C++" (MSVC) via Visual Studio Build Tools.
3. **Ikon aplikasi** — Tauri butuh file ikon yang direferensikan di `tauri.conf.json`.
   Generate dari satu PNG logo:
   ```
   pnpm tauri icon path/ke/logo.png
   ```
   Ini mengisi `src-tauri/icons/`. Tanpa ini, `tauri dev`/`build` gagal.

## Menjalankan

```
pnpm tauri dev      # dev desktop app (frontend + backend)
pnpm tauri build    # bundle installer
```

## Struktur

- `src/db/schema.rs` — CREATE TABLE (idempotent, jalan tiap startup)
- `src/db/models.rs` — struct domain (serialize camelCase → cocok dengan TS entities)
- `src/db/repositories/` — 1 file per entity (product, category, transaction)
- `src/commands/` — 1 file per domain command group (product, category, transaction, printer — thin, panggil repo)
- DB file: `pos.db` di app data dir OS.

## Cakupan saat ini

Backend Rust ini baru mencakup **product / category / transaction** dalam bentuk MVP —
field lanjutan produk (harga per tier, multi-satuan, kit, batch, **varian + SKU**) juga
masih hidup di frontend. Modul baru (supplier, purchase order, stock ledger, opname,
batch, shift, promo, loyalty, piutang, audit) berjalan di frontend via **zustand +
localStorage** dan **belum** punya repository SQLite di sini — perluasan menyusul saat
`desktop-001` dibuka (Rust + MSVC terpasang).
Pola penambahan: 1 file repo baru di `db/repositories/` + 1 group command, tanpa mengubah
yang lama (Open/Closed).
