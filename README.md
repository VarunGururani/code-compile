# Online Code Compiler

A browser-based, multi-language code execution platform built with **React + Vite + JSX** and the **Monaco** editor. Code is executed in isolated Docker containers via the public **CodeX API** - no setup, no Docker installation, no API keys required.

## Features

- **Rich editor** - Monaco editor with syntax highlighting, bracket matching, word wrap and keyboard shortcuts.
- **7 languages** preconfigured: JavaScript, Python, Java, C, C++, C#, Go.
- **Real execution** - every Run sends your code to the CodeX API which compiles and runs it inside a Docker sandbox and returns the output.
- **Stdin support** for programs that read from standard input.
- **Persistent state** - code per language, stdin and theme are stored in localStorage.
- **Light / dark themes** and `Ctrl/Cmd + Enter` to run.
- **Download as file**, reset-to-template, clear-output.
- **Responsive layout** that collapses on small screens.

## Project structure

```
.
|-- src/
|   |-- components/         (Header, Toolbar, LanguageSelect, StdinPanel, OutputPanel)
|   |-- styles/global.css   (IDE-like dark/light theme)
|   |-- languages.js        (Language catalogue + Piston metadata)
|   |-- runner.js           (HTTP client for the execution backend)
|   |-- App.jsx             (Main shell)
|   `-- main.jsx            (React entry point)
|-- public/logo.svg
|-- Dockerfile              (Multi-stage Node + nginx)
|-- nginx.conf              (SPA fallback + gzip)
|-- .github/workflows/ci.yml (GitHub Actions: build + Docker image)
|-- vite.config.js
`-- package.json
```

## Getting started

### Prerequisites

- Node.js 18+ (20 recommended)
- npm 9+

### Install and run

```bash
npm install
npm run dev
```

Open http://localhost:5173.

That's it. Java, Python, C++, etc. work immediately - no Docker, no Judge0, no API keys needed.

### Build

```bash
npm run build
npm run preview
```

### Docker (optional)

```bash
docker build -t online-code-compiler .
docker run --rm -p 8080:80 online-code-compiler
```

Visit http://localhost:8080.

## How execution works

```
+-----------------+       HTTPS       +------------------------------+
|  React Frontend |  --------------->  |  CodeX API (api.codex...)    |
|                 |                    |  Runs each program in a      |
|  User clicks    |                    |  Docker container            |
|  "Run"          |  <---------------  |  Returns JSON response       |
|                 |  output / error    |                              |
+-----------------+                    +------------------------------+
```

The CodeX API is open source (https://github.com/Jaagrav/CodeX). To use a
different backend (e.g. your own self-hosted instance), set the env var
`VITE_EXECUTION_API_URL` before building.

## CI / CD

`.github/workflows/ci.yml` runs on every push and pull request:

1. Installs dependencies with npm cache.
2. Produces the production Vite bundle.
3. Uploads the `dist/` artifact for 7 days.
4. Builds the Docker image with Buildx and GitHub Actions cache.

## License

MIT
