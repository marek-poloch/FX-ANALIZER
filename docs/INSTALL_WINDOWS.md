# Windows 11 install guide

Follow these steps if this is your first time running a Docker-based monorepo.

## 1. Install Docker Desktop

1. Download from https://www.docker.com/products/docker-desktop/
2. Run the installer. Pick **"Use WSL 2 instead of Hyper-V"** if prompted.
3. Reboot when asked.
4. Open Docker Desktop → Settings → Resources. Give it at least **4 GB RAM** and **2 CPUs**. TimescaleDB and the Python quant engine need room to breathe.

Verify:
```powershell
docker --version
docker compose version
```

## 2. Install Git and Node.js (only needed if you want to run outside Docker)

- Git: https://git-scm.com/download/win
- Node.js 20 LTS: https://nodejs.org
- pnpm (after Node installs):
  ```powershell
  corepack enable
  corepack prepare pnpm@9.0.0 --activate
  ```

## 3. Clone the repo

```powershell
cd "F:\CLAUDE CODE"
git clone https://github.com/marek-poloch/FX-ANALIZER.git
cd FX-ANALIZER
```

## 4. Configure environment

```powershell
copy .env.example .env
```
Default values work for demo mode. No API keys required.

## 5. Start the stack (demo)

```powershell
docker compose --profile demo up --build
```

First build takes 5–10 minutes (downloads Node, Python, TimescaleDB images). Subsequent builds use cache.

When you see:
```
fxradar-web          | ▲ Next.js ... ready
fxradar-api          | [Nest] ... FX Whale Radar API listening on port 4000
fxradar-quant-engine | INFO:     Uvicorn running on http://0.0.0.0:5000
```

open:
- Dashboard: http://localhost:3000
- API health: http://localhost:4000/health
- Quant health: http://localhost:5000/health

## 6. Stopping

```powershell
docker compose down
```

Add `-v` to also wipe volumes (Postgres data, Redis data) and get a clean slate:
```powershell
docker compose down -v
```

## 7. Troubleshooting

- **Port already in use**: change `WEB_PORT`, `API_PORT`, or `POSTGRES_PORT` in `.env`.
- **Windows Defender slows container builds**: add `F:\CLAUDE CODE\FX-ANALIZER` to exclusions.
- **"docker daemon not running"**: start Docker Desktop.
- **TimescaleDB init fails**: remove the `postgres_data` volume and restart.
  ```powershell
  docker compose down -v
  docker compose --profile demo up --build
  ```
- **Line endings**: Git may warn about CRLF. That's expected on Windows; Docker containers use LF internally. Run:
  ```powershell
  git config --global core.autocrlf input
  ```
