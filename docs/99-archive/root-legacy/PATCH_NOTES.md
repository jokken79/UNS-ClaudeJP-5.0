# Patch Notes – auto-audit-upgrade

## Backend Security Enhancements
- Enabled stricter security middleware headers (CSP, HSTS, COOP/CORP, etc.).
- Added a readiness-focused `/api/health` endpoint that verifies database connectivity and reports application metadata.
- Hardened JWT generation and validation by enforcing issuer/audience claims, `iat/nbf` timestamps, and unique identifiers.

## Frontend (Next.js 16)
- Centralized HTTP security headers with a dynamic Content-Security-Policy derived from the configured API URL.
- Added an authentication middleware that guards private routes and performs SSR-friendly redirects based on a secure cookie mirror of the session token.
- Synced the auth Zustand store with an `uns-auth-token` cookie and introduced landscape A4 print styles for reports.

## Tooling & DevOps
- Introduced `docker-compose.example.override.yml` with dev/prod profiles and robust healthchecks.
- Added a placeholder seed script at `backend/app/scripts/seed.py` that can be extended with real data fixtures.
- Rebuilt the GitHub Actions workflow to lint/type-check/build both backend and frontend with dependency caching.

## Getting Started
1. Copy `docker-compose.example.override.yml` to `docker-compose.override.yml` and adjust environment variables.
2. Run `docker compose --profile dev up --build` for local development or `--profile prod` for a production-like stack.
3. Execute `python backend/app/scripts/seed.py` to run the baseline seed scaffold when preparing new environments.
4. The `/api/health` endpoint now surfaces environment readiness status for CI/CD probes.
