#!/usr/bin/env sh
# === Subsistem harness: ENVIRONMENT ===
# Satu perintah dari fresh clone -> siap kerja. Idempoten (aman dijalankan berkali-kali).
# Tujuan: agent/manusia tidak perlu menebak cara menyiapkan runtime.
set -e

echo "-> install dependencies (pnpm)"
pnpm install

echo ""
echo "OK Environment siap."
echo "   Dev server : pnpm dev        (buka http://localhost:1420)"
echo "   Verifikasi : sh verify.sh"
