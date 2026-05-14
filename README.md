# Online Code Compiler

A browser-based, multi-language code execution platform built with **React + Vite + JSX** and the **Monaco** editor. Code is executed in isolated sandboxes via the **JDoodle Compiler API**.

The app ships with two ways to run it:

| Mode | Command | What it does |
|------|---------|--------------|
| **Dev** | `npm run dev` | Vite dev server (`localhost:5173`) with hot reload. The proxy is built into Vite. |
| **Production / Docker** | `docker compose up` | Self-contained Node + Express container that serves the built React bundle and proxies JDoodle calls. |

In both modes the JDoodle credentials are kept server-side. They never reach the browser.

## Features

- 9 languages preconfigured: JavaScript, Python, Java, C, C++, C#, Go, Ruby, PHP.
- Monaco editor with syntax highlighting, word wrap, line numbers and `Ctrl/Cmd+Enter` to run.
- Tabbed Output / Input pane with stdout / stderr coloring and run-time badge.
- Light / dark themes, status bar (line/col, language, run time).
- Persists code per language, theme and stdin in `localStorage`.
- Multi-stage Dockerfile + docker-compose for one-command deployment.
- GitHub Actions CI: build the bundle and the Docker image on every push.

## Getting started

### 1. Get JDoodle credentials (free)

1. Sign up at [https://www.jdoodle.com/compiler-api](https://www.jdoodle.com/compiler-api).
2. Copy your **Client ID** and **Client Secret** from the dashboard.
3. Free tier: 200 executions per day.

### 2A. Run in dev mode

```bash
git clone https://github.com/VarunGururani/code-compile.git
cd code-compile

# Create .env.local (next to package.json) with:
#   JDOODLE_CLIENT_ID=...
#   JDOODLE_CLIENT_SECRET=...
cp .env.example .env.local

npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### 2B. Run in Docker (production-like)

```bash
# Create .env (next to docker-compose.yml) with the same two variables
cp .env.example .env

docker compose up --build
```

Open [http://localhost:8080](http://localhost:8080).

To stop:
```bash
docker compose down
```

## Architecture

```
┌──────────────┐    POST /api/run    ┌─────────────────┐    POST + creds    ┌──────────────┐
│   Browser    │ ─────────────────── │  Server (proxy) │ ─────────────────  │  JDoodle API │
│  React app   │ ◄────── output ──── │                 │ ◄────── output ─── │  (Docker)    │
└──────────────┘                     └─────────────────┘                    └──────────────┘
                                       Vite middleware (dev)
                                       Node/Express     (prod)
```

- **Browser** sends `{ script, stdin, language, versionIndex }` to a same-origin path.
- **Server** (Vite middleware in dev, Express in the container) injects `clientId` / `clientSecret`, forwards to `https://api.jdoodle.com/v1/execute`, and pipes the response back.
- **JDoodle** runs each submission inside an isolated Docker container on their side.
- The browser bundle never sees the credentials.

## Project structure

```
.
|-- src/
|   |-- components/         (Header, Toolbar, LanguageSelect, SidePane, Icons)
|   |-- styles/global.css
|   |-- languages.js        (Language catalogue + JDoodle metadata)
|   |-- runner.js           (HTTP client for /api/run)
|   |-- App.jsx
|   `-- main.jsx
|-- public/logo.svg
|-- server.js               (Production Express server: static + /api/run proxy)
|-- vite.config.js          (Dev server with same /api/run proxy)
|-- Dockerfile              (Multi-stage: Node builder -> Node runtime)
|-- docker-compose.yml      (One-command run with .env)
|-- .github/workflows/ci.yml (Build + Docker image on every push)
`-- package.json
```

## CI / CD

`.github/workflows/ci.yml` runs on every push and pull request:

1. Installs dependencies.
2. Builds the production Vite bundle.
3. Uploads `dist/` as an artifact.
4. Builds the Docker image with Buildx.

## License

MIT
