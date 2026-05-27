#!/bin/sh
set -e

WEB_PORT="${PORT:-3000}"
API_PORT="${API_INTERNAL_PORT:-8081}"

external_api_healthy() {
  case "${API_URL:-}" in
    *127.0.0.1*|*localhost*)
      return 1
      ;;
    http://*|https://*)
      api_base="${API_URL%/}"
      if curl -sf --max-time 8 "${api_base}/health" >/dev/null 2>&1; then
        return 0
      fi
      echo "[web] external API_URL not reachable: ${api_base}/health"
      return 1
      ;;
    *)
      return 1
      ;;
  esac
}

if external_api_healthy; then
  echo "[web] external API_URL=${API_URL} — Next.js only (separate api service)"
  unset UNIFIED_DEPLOY
  cd /app/frontend
  PORT="${WEB_PORT}" HOSTNAME=0.0.0.0 exec npm start
fi

export API_INTERNAL_PORT="${API_PORT}"
export API_URL="http://127.0.0.1:${API_PORT}"
export UNIFIED_DEPLOY=1

echo "[unified] web=${WEB_PORT} api=${API_PORT}"

echo "[unified] starting Go API..."
PORT="${API_PORT}" /app/server &
API_PID=$!

echo "[unified] waiting for API /health..."
ready=0
i=0
while [ "$i" -lt 90 ]; do
  if curl -sf "http://127.0.0.1:${API_PORT}/health" >/dev/null 2>&1; then
    ready=1
    break
  fi
  if ! kill -0 "$API_PID" 2>/dev/null; then
    echo "[unified] ERROR: Go API process exited before becoming ready"
    wait "$API_PID" 2>/dev/null || true
    exit 1
  fi
  i=$((i + 1))
  sleep 0.5
done

if [ "$ready" -ne 1 ]; then
  echo "[unified] ERROR: Go API not ready on 127.0.0.1:${API_PORT} after 45s"
  kill "$API_PID" 2>/dev/null || true
  exit 1
fi

echo "[unified] API ready; starting Next.js on ${WEB_PORT}"
cd /app/frontend
PORT="${WEB_PORT}" HOSTNAME=0.0.0.0 exec npm start
