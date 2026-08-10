#!/usr/bin/env sh
# === Subsistem harness: FEEDBACK (verification gate) ===
# Aturan harness: agent TIDAK BOLEH klaim "selesai" sebelum skrip ini exit 0.
# Ini pengganti "percaya kata agent" -> diganti bukti yang bisa dicek mesin.
# Reuse skrip yang sudah ada di package.json (jangan tulis ulang logikanya).
set -e

echo "-> [1/2] build  (tsc --noEmit + vite build)"
pnpm run build

echo "-> [2/2] test   (vitest run)"
pnpm run test

echo ""
echo "OK SEMUA HIJAU -- aman klaim selesai."
