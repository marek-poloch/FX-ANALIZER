# Tests

Each workspace owns its own tests; this directory is a placeholder for future cross-service e2e scenarios (Playwright, docker-compose smoke).

## Running today

- API unit tests: `pnpm --filter @fxradar/api test`
- Quant engine: `cd services/quant-engine && pytest`
