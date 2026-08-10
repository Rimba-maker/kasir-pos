#!/usr/bin/env bash
# === Subsistem harness: ENVIRONMENT ===
# Satu jalur startup baku: install -> verify -> (opsional) start.
# Mengikuti pola template kursus (install/verify/start + RUN_START_COMMAND).
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "==> Working directory: $PWD"

echo "==> Sinkron dependencies"
pnpm install

echo "==> Verifikasi baseline"
sh verify.sh

echo "==> Startup command: pnpm dev   (http://localhost:1420)"
if [ "${RUN_START_COMMAND:-0}" = "1" ]; then
  echo "==> Menjalankan app"
  exec pnpm dev
fi

echo "Set RUN_START_COMMAND=1 kalau mau init.sh langsung menjalankan app."
