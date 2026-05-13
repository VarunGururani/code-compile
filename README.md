# Online Code Compiler

A browser-based, multi-language code execution platform built with **React + Vite + JSX** and the **Monaco** editor. Code is executed in isolated containers via the **JDoodle Compiler API**.

## Features

- **Rich editor** - Monaco editor with syntax highlighting, bracket matching, word wrap and keyboard shortcuts.
- **9 languages** preconfigured: JavaScript, Python, Java, C, C++, C#, Go, Ruby, PHP.
- **Real execution** - every Run sends your code to JDoodle's API which compiles and runs it server-side.
- **Stdin support** for programs that read from standard input.
- **Persistent state** - code per language, stdin and theme are stored in localStorage.
- **Light / dark themes** and `Ctrl/Cmd + Enter` to run.
- **Download as file**, reset-to-template, clear-output.
- **Responsive layout** that collapses on small screens.
- **Secrets stay server-side** - the Vite dev proxy injects the JDoodle credentials into outbound requests so they never appear in the browser bundle.

## Setup (one-time, ~2 minutes)

### 1. Get JDoodle API credentials (free)

1. Sign up at [https://www.jdoodle.com/compiler-api](https://www.jdoodle.com/compiler-api)
2. Go to your dashboard - copy your **Client ID** and **Client Secret**
3. Free tier: 200 executions per day (plenty for personal use)

### 2. Install and configure

```bash
git clone https://github.com/VarunGururani/code-compile.git
cd code-compile
npm install
```

Create a file named `.env.local` in the project root (next to `package.json`):

```
JDOODLE_CLIENT_ID=your-client-id-here
JDOODLE_CLIENT_SECRET=your-client-secret-here
```

> Note: these env vars are NOT prefixed with `VITE_` on purpose. They are only read by the dev proxy on the server side and never leak into the browser bundle.

### 3. Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and run any language.

## Project structure

```
.
|-- src/
|   |-- components/         (Header, Toolbar, LanguageSelect, StdinPanel, OutputPanel)
|   |-- styles/global.css   (IDE-like dark/light theme)
|   |-- languages.js        (Language catalogue + JDoodle metadata)
|   |-- runner.js           (HTTP client for the execution backend)
|   |-- App.jsx             (Main shell)
|   `-- main.jsx            (React entry point)
|-- public/logo.svg
|-- Dockerfile              (Multi-stage Node + nginx)
|-- nginx.conf              (SPA fallback + gzip)
|-- .github/workflows/ci.yml (GitHub Actions: build + Docker image)
|-- vite.config.js          (Includes the JDoodle proxy)
`-- package.json
```

## How execution works

```
+-----------------+              +---------------------+              +------------------+
|  React Frontend |  POST        |  Vite dev proxy     |  POST        |  JDoodle API     |
|  /api/run       |  --------->  |  injects clientId/  |  --------->  |  isolated runner |
|  (browser)      |              |  clientSecret       |              |                  |
|                 |  <---------  |                     |  <---------  |  output / error  |
+-----------------+              +---------------------+              +------------------+
```

The browser only ever talks to `localhost:5173`, so there is no CORS issue and no secret in the bundle.

## Production deployment

The included `Dockerfile` builds a static bundle and serves it with nginx. **Important:** the Vite dev proxy only runs in development. For production you need a small backend that accepts POSTs, adds the credentials, and forwards them to JDoodle. Examples:

- A serverless function (Vercel/Netlify/Cloudflare Workers)
- A small Node/Express server
- An nginx `location /api/run` block that adds the credentials

If you only need this locally, the dev proxy is enough.

## CI / CD

`.github/workflows/ci.yml` runs on every push and pull request:

1. Installs dependencies with npm cache.
2. Produces the production Vite bundle.
3. Uploads the `dist/` artifact for 7 days.
4. Builds the Docker image with Buildx and GitHub Actions cache.

## License

MIT
