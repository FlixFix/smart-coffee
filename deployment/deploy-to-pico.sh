#!/bin/bash
#
# OTA deploy of Pico Python files over the Pico's own HTTP server, followed by a
# remote reset. Each file is POSTed to /pico/upload?name=<file> and written to the
# Pico's flash root; a final POST /pico/reset reboots into the new code.
#
# This replaces the earlier WebREPL-based flow: MicroPython's WebREPL does not
# coexist with the uasyncio HTTP server running in main.py, so uploads go over the
# already-running HTTP server instead. No WebREPL setup or password is required.
#
# Bootstrapping (one time, over USB via Thonny or mpremote):
#   The /pico/upload and /pico/reset endpoints must already be on the Pico for OTA
#   to work. Flash the current top-level .py files once over USB. Every deploy after
#   that can use this script.
#
# Usage:
#   PICO_IP=192.168.178.XX ./deployment/deploy-to-pico.sh
#
# Optional env vars:
#   PICO_PORT   HTTP port (default: 80)

set -euo pipefail

: "${PICO_IP:?PICO_IP is required (the Pico static IP)}"
PICO_PORT="${PICO_PORT:-80}"

BASE="http://$PICO_IP:$PICO_PORT"

# Only top-level .py files are deployed. Third-party libs under pico/lib/ change
# rarely and are flashed manually if needed.
FILES=(
    "main.py"
    "wifi.py"
    "web_server.py"
    "access_point.py"
    "config.py"
    "config_helper.py"
    "devices.py"
    "httpUtils.py"
    "logger.py"
    "pico_coffee.py"
    "pico_pid.py"
)

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT/pico"

echo "Deploying ${#FILES[@]} files to Pico at $BASE ..."
for f in "${FILES[@]}"; do
    if [ ! -f "$f" ]; then
        echo "  skip (missing): $f"
        continue
    fi
    echo "  -> $f"
    curl -fsS -X POST --data-binary "@$f" \
        -H "Content-Type: application/octet-stream" \
        "$BASE/pico/upload?name=$f" >/dev/null
done

echo "Triggering reset on the Pico ..."
curl -fsS -X POST "$BASE/pico/reset" >/dev/null || {
    echo "Warning: reset request failed. The new files are on the Pico but you'll need to reboot it manually." >&2
    exit 1
}

echo "Done. The Pico is rebooting."
