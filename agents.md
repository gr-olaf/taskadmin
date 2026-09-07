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

### Missing (not installed)
- git, curl, ssh
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

- **Frontend-only:** HTML, CSS, JavaScript (no backend servers)
- **UI Framework:** Bootstrap 5 (via CDN)
  - CSS: `https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css`
  - JS Bundle: `https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js`
- **Data Storage:** localStorage (browser)
- **Launch:** `darkhttpd . --port 8080` (serves files from current directory)
- **Language:** Russian (interface text)
- **Adaptive:** Bootstrap grid for responsive layout (desktop, tablet, mobile)
- **Build:** No build tools required; no npm/yarn needed for the app itself
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
- **Dev server:** `serve` (auto-started by Playwright on port 3000)

### Test Files
| File | Coverage | Tests |
|------|----------|-------|
| `e2e/tasks.spec.js` | CRUD: create, edit, delete, cancel | 13 |
| `e2e/validation.spec.js` | Form validation: title, description | 9 |
| `e2e/drag-and-drop.spec.js` | Drag & drop reordering + persistence | 3 |
| `e2e/persistence.spec.js` | localStorage, empty state, counter | 9 |

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
- **Jobs:**
  - `test`: checkout → setup Node 20 → `npm ci` → install Playwright Chromium → run tests (`npm test`)
  - `deploy`: runs after `test` passes → deploy static site to GitHub Pages
- **Artifacts:** `playwright-report` uploaded on failure (retained 14 days)

### Test Pattern (beforeEach)
```js
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
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
