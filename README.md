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
docker compose -f compose.prod.yaml run --rm migrator
```
This uses the `tools` profile, so it won't run with standard `up` commands unless explicitly requested.