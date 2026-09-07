# Agents Configuration

## Environment

- **OS:** Alpine Linux v3.24.1
- **Architecture:** x86_64
- **Package Manager:** apk (Alpine Package Keeper)

## System State

### Available Tools
| Tool | Path |
|------|------|
| wget | /usr/bin/wget |
| apk | /sbin/apk |
| darkhttpd | /usr/bin/darkhttpd |
| node | /usr/bin/node |
| npm | /usr/bin/npm |
| chromium-browser | /usr/bin/chromium-browser |
| git | /usr/bin/git |
| psql | /usr/bin/psql |

### Missing (not installed)
- curl, ssh
- python3 / pip
- gcc / g++ / make / cmake
- docker / podman

## Figma API Integration

- **Token location:** `.env` file (not committed to git)
- **Files:**
  - `js/figma.js` — API client with functions: getFile, getFileNodes, getImages, getFileComponents, getFileStyles, getComments, getMe
  - `js/figma-example.js` — usage example
  - `js/figma-inspect.js` — inspect specific Figma design
- **Dependencies:** dotenv, axios (installed in node_modules)
- **Commands:**
  ```sh
  npm run figma:example    # run Figma API example
  node js/figma-inspect.js # inspect Figma design
  ```

## PostgreSQL Connection

The app supports two environments: local development and production, switched via `NODE_ENV`.

| Mode | Env file | Host | SSL |
|------|----------|------|-----|
| Local (`npm start` / `npm run dev`) | `.env` | `my-postgres` (container) | off |
| Production (`npm run start:prod` / `NODE_ENV=production`) | `.env.production` | Render.com | on |

`server/db.js` and `server/app.js` load `.env` by default and `.env.production` when `NODE_ENV=production`.

### Local (development)

Another container `my-postgres` is available on the network.

**Local credentials (`.env`):**
| Parameter | Value |
|-----------|-------|
| Host | `my-postgres` |
| Port | `5432` |
| User | `postgres` |
| Password | `root` |
| Database | `taskadmin` |

**Quick connect (shell):**
```sh
PGPASSWORD=root psql -h my-postgres -U postgres -d taskadmin
```

### Production (Render.com)

**Config file:** `.env.production` (not committed to git, see `.gitignore`). On Render the DB config is normally provided via environment variables instead.

**Precedence in `server/db.js`:**
1. `DATABASE_URL` (connection string) — auto‑provided by Render for its managed Postgres
2. Individual `PGHOST` / `PGPORT` / `PGUSER` / `PGPASSWORD` / `PGDATABASE` vars
3. Local fallback defaults (`my-postgres` / `postgres` / `root` / `taskadmin`) — only for local dev

| Parameter | Value |
|-----------|-------|
| Host | `dpg-daf9q5v40ujc73aaoh2g-a.frankfurt-postgres.render.com` |
| Port | `5432` |
| User | `taskadminuser` |
| Database | `taskadmindb_rbw2` |
| SSL | `{ rejectUnauthorized: false }` (required by Render) |

**Env vars to set in Render dashboard** (as an alternative to `DATABASE_URL`):
```sh
NODE_ENV=production
PGHOST=dpg-daf9q5v40ujc73aaoh2g-a.frankfurt-postgres.render.com
PGPORT=5432
PGUSER=taskadminuser
PGPASSWORD=<secret>
PGDATABASE=taskadmindb_rbw2
```

**Quick connect (shell):**
```sh
PGPASSWORD=4XEmZ1MNnBu5EEs5Nb77j2LEJZmhLMsQ PGSSLMODE=require psql -h dpg-daf9q5v40ujc73aaoh2g-a.frankfurt-postgres.render.com -U taskadminuser -d taskadmindb_rbw2
```

### Env vars used by the app

Same variable names in both env files (fallback defaults shown):
```sh
PGHOST=my-postgres
PGPORT=5432
PGUSER=postgres
PGPASSWORD=root
PGDATABASE=taskadmin
```

**Schema (auto-created on startup by `initDb`):**
```sql
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 255),
  description TEXT NOT NULL DEFAULT '' CHECK (char_length(description) <= 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  position INT NOT NULL DEFAULT 0
);
```

## Setup Commands

### Install essential tools
```sh
apk add --no-cache git curl openssh build-base
```

### Install Node.js
```sh
apk add --no-cache nodejs npm
```

### Install Python
```sh
apk add --no-cache python3 py3-pip
```

### Install all common dev tools
```sh
apk add --no-cache git curl openssh build-base nodejs npm python3 py3-pip
```

## Project Technology Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js + Express 5
- **Database:** PostgreSQL — локально PostgreSQL 18 (container `my-postgres`), продакшен на Render.com (`taskadmindb_rbw2`)
- **UI Framework:** Bootstrap 5 (via CDN)
  - CSS: `https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css`
  - JS Bundle: `https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js`
- **API Endpoints:**
  | Method | Path | Description |
  |--------|------|-------------|
  | `GET` | `/api/tasks` | list all tasks |
  | `GET` | `/api/tasks/:id` | get one task |
  | `POST` | `/api/tasks` | create task |
  | `PUT` | `/api/tasks/:id` | update task |
  | `DELETE` | `/api/tasks/:id` | delete task |
  | `PUT` | `/api/tasks/reorder` | reorder tasks (DnD persistence) |
- **Launch:**
  - Local: `npm start` or `npm run dev` — Express serves API + static files on port 8080, DB = `my-postgres` (`.env`)
  - Production: `npm run start:prod` (sets `NODE_ENV=production`) — DB = Render.com (`.env.production`, SSL)
- **Language:** Russian (interface text)
- **Adaptive:** Bootstrap grid for responsive layout (desktop, tablet, mobile)
- **Build:** No build tools required
- **Figma Integration:** API for design system extraction (dotenv + axios)
  - Token: stored in `.env` as `FIGMA_TOKEN`
  - Files: `js/figma.js`, `js/figma-example.js`, `js/figma-inspect.js`

## Local Dev Server (darkhttpd)

- **Installed:** `darkhttpd` v1.17 — lightweight static file server
- **Path:** `/usr/bin/darkhttpd`
- **Default port:** 8080 (non-root), 80 (root)
- **Usage:**
  ```sh
  darkhttpd . --port 8080
  ```
- Access at: `http://localhost:8080`
- Serves the project root as static files (`index.html`, `css/`, `js/`)

## E2E Testing (Playwright)

- **Framework:** Playwright (`@playwright/test`)
- **Browser:** Chromium (system-installed at `/usr/bin/chromium-browser`)
- **Config:** `playwright.config.js`
- **Test directory:** `e2e/`
- **Dev server:** `node server/app.js` (auto-started by Playwright on port 8080)

### Test Files
| File | Coverage | Tests |
|------|----------|-------|
| `e2e/tasks.spec.js` | CRUD: create, edit, delete, cancel | 13 |
| `e2e/validation.spec.js` | Form validation: title, description | 9 |
| `e2e/drag-and-drop.spec.js` | Drag & drop reordering + persistence | 3 |
| `e2e/persistence.spec.js` | API persistence, empty state, counter | 9 |

### Commands
```sh
npm test                 # run all tests
npm run test:debug       # interactive debug mode
npm run test:headed      # run with visible browser
npm run test:ui          # Playwright UI mode
```

### Alpine-specific Notes
- Playwright's downloaded headless shell is built for glibc (Ubuntu) and does not work on Alpine (musl)
- Config auto-detects system Chromium at `/usr/bin/chromium-browser` and uses it when available
- System Chromium installed via: `apk add --no-cache chromium`

### CI/CD (GitHub Actions)
- **Workflow:** `.github/workflows/deploy.yml`
- **Triggers:** push to `main` and manual `workflow_dispatch`
- **Runner:** `ubuntu-latest`
- **Services:** PostgreSQL 16 (container with `taskadmin` database)
- **Jobs:**
  - `test`: checkout → setup Node 20 → `npm ci` → install Playwright Chromium → run tests (`npm test`)
  - `deploy`: runs after `test` passes → deploy static site to GitHub Pages
- **Artifacts:** `playwright-report` uploaded on failure (retained 14 days)

### Test Pattern (beforeEach)
```js
const { clearTasks, openApp } = require("./helpers");

test.beforeEach(async ({ page, request }) => {
  await clearTasks(request);  // truncates tasks via API
  await openApp(page);        // goto("/") + wait for initial load
});
```

## Git: Conventional Commits

All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>
```

**Types:**
| Type | Usage |
|------|-------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code style (formatting, no logic change) |
| `refactor` | Code refactoring (no feature/fix) |
| `perf` | Performance improvement |
| `test` | Adding/fixing tests |
| `chore` | Build process, tooling, dependencies |
| `ci` | CI/CD changes |

**Examples:**
```
feat: add drag-and-drop task reordering
fix: correct validation for empty title
docs: update spec with DnD requirements
chore: install git and curl in Alpine
```

**Rules:**
- Description in lowercase (English or Russian)
- No period at end of description
- Keep subject line under 72 characters
- Use `!` after type for breaking changes: `feat!: remove IE11 support`

## Notes

- Alpine uses `apk` as its package manager (not apt/yum/dnf)
- Packages are installed with `apk add --no-cache <package>`
- Search packages with `apk search <query>`
- Info about a package with `apk info <package>`
- This is a minimal container-like environment; most development tools need to be installed
