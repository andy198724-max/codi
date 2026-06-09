#!/usr/bin/env bash
# Unified CODI start script
# Starts codi-core API server, optionally codi-studio and codi-extension

set -euo pipefail

CODI_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CORE_DIR="$CODI_ROOT"
STUDIO_DIR="$(cd "$CODI_ROOT/../codi-studio" && pwd 2>/dev/null || echo "")"
EXTENSION_DIR="$(cd "$CODI_ROOT/../codi-extension" && pwd 2>/dev/null || echo "")"

echo "=== CODI Launcher ==="
echo "Core:  $CORE_DIR"
echo "Studio: ${STUDIO_DIR:-not found}"
echo "Ext:   ${EXTENSION_DIR:-not found}"
echo ""

start_core() {
  echo "[*] Starting CODI Core API server..."
  cd "$CORE_DIR"
  python inference/server.py &
  CORE_PID=$!
  echo "[*] Core PID: $CORE_PID (port 11435)"
}

start_studio() {
  if [ -n "$STUDIO_DIR" ]; then
    echo "[*] Starting CODI Studio..."
    cd "$STUDIO_DIR"
    npm run tauri dev &
    STUDIO_PID=$!
    echo "[*] Studio PID: $STUDIO_PID"
  fi
}

cleanup() {
  echo ""
  echo "[*] Shutting down..."
  [ -n "${CORE_PID:-}" ] && kill "$CORE_PID" 2>/dev/null && echo "[*] Core stopped"
  [ -n "${STUDIO_PID:-}" ] && kill "$STUDIO_PID" 2>/dev/null && echo "[*] Studio stopped"
  exit 0
}

trap cleanup SIGINT SIGTERM

start_core
start_studio

echo ""
echo "[✓] CODI is running"
echo "    API:  http://localhost:11435"
echo "    Docs: http://localhost:11435/docs"
echo ""
echo "Press Ctrl+C to stop all services."

wait
