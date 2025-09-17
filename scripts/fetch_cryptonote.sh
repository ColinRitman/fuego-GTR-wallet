#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CRYPTO_DIR="$ROOT_DIR/src-tauri/cryptonote"
UPSTREAM_URL="https://github.com/ColinRitman/fuego"

echo "[fetch_cryptonote] Root: $ROOT_DIR"
echo "[fetch_cryptonote] Target: $CRYPTO_DIR"

mkdir -p "$CRYPTO_DIR"

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

echo "[fetch_cryptonote] Cloning upstream..."
git clone --depth=1 "$UPSTREAM_URL" "$TMP_DIR/upstream"

# Copy only cryptonote-related sources (adjust path if upstream layout differs)
if [ -d "$TMP_DIR/upstream/src/cryptonote" ]; then
  rsync -a --delete "$TMP_DIR/upstream/src/cryptonote/" "$CRYPTO_DIR/"
elif [ -d "$TMP_DIR/upstream/cryptonote" ]; then
  rsync -a --delete "$TMP_DIR/upstream/cryptonote/" "$CRYPTO_DIR/"
else
  echo "[fetch_cryptonote] Could not locate cryptonote sources in upstream repo." >&2
  exit 1
fi

echo "[fetch_cryptonote] Sync complete. Files available in $CRYPTO_DIR"

