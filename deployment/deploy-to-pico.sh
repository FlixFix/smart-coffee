#!/bin/bash
#
# OTA deploy of Pico Python files via WebREPL, followed by a remote reset
# through the existing HTTP webserver.
#
# One-time setup on the Pico (over USB, via Thonny or mpremote):
#   1. Run `import webrepl_setup` and follow the prompts to set a password.
#      This writes /webrepl_cfg.py on the Pico's flash.
#   2. Reboot the Pico. WebREPL will now start automatically once wifi is up
#      (via webrepl.start() in main.py).
#
# Local prerequisites:
#   - webrepl_cli.py from https://github.com/micropython/webrepl on your PATH,
#     or set WEBREPL_CLI to its full path.
#
# Usage:
#   PICO_IP=192.168.178.XX WEBREPL_PASSWORD=secret ./deployment/deploy-to-pico.sh
#
# Optional env vars:
#   WEBREPL_CLI   path to webrepl_cli.py (default: webrepl_cli.py on PATH)
#   PICO_PORT     HTTP port for the reset call (default: 80)

set -euo pipefail

: "${PICO_IP:?PICO_IP is required (the Pico's static IP)}"
: "${WEBREPL_PASSWORD:?WEBREPL_PASSWORD is required}"
WEBREPL_CLI="${WEBREPL_CLI:-webrepl_cli.py}"
PICO_PORT="${PICO_PORT:-80}"

if ! command -v "$WEBREPL_CLI" >/dev/null 2>&1; then
    echo "Error: $WEBREPL_CLI not found. Set WEBREPL_CLI to the full path, or put webrepl_cli.py on your PATH." >&2
    exit 1
fi

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

echo "Deploying ${#FILES[@]} files to Pico at $PICO_IP ..."
for f in "${FILES[@]}"; do
    if [ ! -f "$f" ]; then
        echo "  skip (missing): $f"
        continue
    fi
    echo "  -> $f"
    "$WEBREPL_CLI" -p "$WEBREPL_PASSWORD" "$f" "$PICO_IP:/$f"
done

echo "Triggering reset on the Pico ..."
curl -fsS -X POST "http://$PICO_IP:$PICO_PORT/pico/reset" >/dev/null || {
    echo "Warning: reset request failed. The new files are on the Pico but you'll need to reboot it manually." >&2
    exit 1
}

echo "Done. The Pico is rebooting."
