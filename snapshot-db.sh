#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP="$(date +"%Y%m%d-%H%M%S")"
BACKUP_FILE="${BACKUP_DIR}/${TIMESTAMP}.sql"
TMP_BACKUP_FILE="${BACKUP_FILE}.tmp"

ENV_NAME="${1:-dev}"

case "${ENV_NAME}" in
  dev)
    DEFAULT_COMPOSE_FILE="compose.dev.yaml"
    DEFAULT_DB_SERVICE="db"
    ;;
  prod)
    DEFAULT_COMPOSE_FILE="compose.prod.yaml"
    DEFAULT_DB_SERVICE="s26db"
    ;;
  *)
    echo "Usage: $0 [dev|prod]" >&2
    exit 1
    ;;
esac

COMPOSE_FILE="${COMPOSE_FILE:-${DEFAULT_COMPOSE_FILE}}"
DB_SERVICE="${DB_SERVICE:-${DEFAULT_DB_SERVICE}}"
DB_USER="${DB_USER:-synergy}"
DB_NAME="${DB_NAME:-synergy}"
DB_PASS="${DB_PASS:-}"
export DB_PASS

if ! command -v docker > /dev/null 2>&1; then
  echo "Error: docker command not found in PATH." >&2
  exit 1
fi

if ! docker info > /dev/null 2>&1; then
  echo "Error: Docker daemon is not running or not reachable." >&2
  exit 1
fi

if [ ! -f "${COMPOSE_FILE}" ]; then
  echo "Error: compose file '${COMPOSE_FILE}' not found." >&2
  exit 1
fi

if [ -z "$(docker compose -f "${COMPOSE_FILE}" ps -q "${DB_SERVICE}")" ]; then
  echo "Error: no running container found for compose service '${DB_SERVICE}'." >&2
  exit 1
fi

mkdir -p "${BACKUP_DIR}"

cleanup_tmp() {
  rm -f "${TMP_BACKUP_FILE}"
}

trap cleanup_tmp EXIT

docker compose -f "${COMPOSE_FILE}" exec -T "${DB_SERVICE}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" > "${TMP_BACKUP_FILE}"
mv "${TMP_BACKUP_FILE}" "${BACKUP_FILE}"
trap - EXIT

echo "Snapshot created: ${BACKUP_FILE}"
