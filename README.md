# Synergy 2026

## Setup

1. Fork and clone the repo.

2. Install dependencies.
```bash
pnpm install
```

3. Fill the .env.
```bash
cp .env.example .env
```

4. Run the app.
```bash
pnpm dev
```

## Docs

### Production Database Migrations
To run database migrations in production using the migrator tool:
```bash
docker compose -f compose.prod.yaml run --build --rm migrator
```
This uses the `tools` profile, so it won't run with standard `up` commands unless explicitly requested.

### Zero-downtime + Rollback strategy
Make the latest image as fallback.
```bash
docker tag synergy-26-web26:latest synergy-26-web26:fallback
```

Run the zero-downtime deployment.
```bash
docker compose -f compose.prod.yaml up -d --build
```

If something goes wrong, rollback to the fallback image.
```bash
docker tag synergy-26-web26:fallback synergy-26-web26:latest
docker compose -f compose.prod.yaml up -d
```