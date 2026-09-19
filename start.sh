#!/usr/bin/env bash

set -euo pipefail

cd "$(dirname "$(readlink -f "$0")")"

COMPOSE=(docker compose -f docker-compose.prod.yml)

if [[ "${1:-}" == "down" ]]; then
    "${COMPOSE[@]}" down
    exit 0
fi

# 1. backend/.env
if [[ ! -f backend/.env ]]; then
    if [[ -f backend/.env.example ]]; then
        cp backend/.env.example backend/.env
        echo "[start] created backend/.env from backend/.env.example"
    else
        echo 'DATABASE_URL="file:./dev.db"' > backend/.env
        echo "[start] created backend/.env with default DATABASE_URL"
    fi
fi

# 2. Caddyfile default_sni (browsers/curl send no SNI for bare IPs)
if [[ ! -f Caddyfile ]]; then
    echo "[start] ERROR: Caddyfile not found in repo root" >&2
    exit 1
fi
if ! grep -q "default_sni" Caddyfile; then
    tmp="$(mktemp)"
    printf '{\n    default_sni localhost\n}\n\n' > "$tmp"
    cat Caddyfile >> "$tmp"
    mv "$tmp" Caddyfile
    echo "[start] added default_sni block to Caddyfile"
fi

# 3. Detect LAN IP (the interface used for the default route, skips docker/libvirt bridges)
LAN_IP="$(ip route get 1.1.1.1 2>/dev/null | awk '/src/ {for(i=1;i<=NF;i++) if($i=="src") print $(i+1); exit}')"
if [[ -z "$LAN_IP" ]]; then
    for ip in $(hostname -I 2>/dev/null); do
        case "$ip" in
            172.17.*|172.18.*|192.168.122.*) continue ;;
            *) LAN_IP="$ip"; break ;;
        esac
    done
fi

if [[ -n "$LAN_IP" ]]; then
    export APP_DOMAIN="localhost, $LAN_IP"
    export DEFAULT_SNI="$LAN_IP"
else
    export APP_DOMAIN="localhost"
    export DEFAULT_SNI="localhost"
    echo "[start] WARNING: could not detect LAN IP, serving localhost only"
fi
echo "[start] APP_DOMAIN=\"$APP_DOMAIN\""

# 4. Start
"${COMPOSE[@]}" down --remove-orphans >/dev/null 2>&1 || true

echo "[start] ------------------------------------------------------------"
echo "[start]  This PC:    https://localhost:8443"
[[ -n "$LAN_IP" ]] && echo "[start]  Other PCs:  https://$LAN_IP:8443"
echo "[start]  (accept the self-signed certificate warning in the browser)"
echo "[start] ------------------------------------------------------------"

if [[ "${1:-}" == "-d" ]]; then
    "${COMPOSE[@]}" up --build -d
    echo "[start] running in background. Logs: docker compose -f docker-compose.prod.yml logs -f"
    echo "[start] stop with: ./start.sh down"
else
    exec "${COMPOSE[@]}" up --build
fi
