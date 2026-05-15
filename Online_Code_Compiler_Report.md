# Online Code Execution Platform — Project Report

---

## TABLE OF CONTENTS

1. Introduction
2. Problem Statement
3. Objectives
4. System Architecture
5. Technology Stack
6. System Design and Implementation
   - 6.1 Frontend (React Application)
   - 6.2 Backend Proxy Server (Node.js + Express)
   - 6.3 Code Execution Engine (JDoodle API)
   - 6.4 Containerization (Docker)
   - 6.5 CI/CD Pipeline (Jenkins + GitHub Actions)
   - 6.6 Cloud Deployment (Microsoft Azure)
7. Azure Services Used
8. Deployment Workflow
9. Security Considerations
10. DevOps Practices Demonstrated
11. Results and Screenshots
12. Future Enhancements
13. Conclusion
14. References

---

## CHAPTER 1: INTRODUCTION

The Online Code Execution Platform is a web-based system that allows users to write, compile, and execute programming code through a browser interface. The platform supports multiple programming languages and provides real-time output generation in an isolated and secure environment.

Traditional code execution systems often face challenges related to scalability, security, and environment consistency. This project addresses these issues by using containerization technology (Docker) to execute user-submitted code safely and efficiently.

The project demonstrates modern DevOps practices including automated builds, containerized deployment using Docker, CI/CD integration using Jenkins and GitHub Actions, and cloud deployment using Microsoft Azure.

---

## CHAPTER 2: PROBLEM STATEMENT

Existing online compilers and code execution platforms face the following challenges:

| Challenge | Description |
|-----------|-------------|
| Security | Running untrusted user code directly on a server is dangerous — malicious code can damage the host system |
| Scalability | A monolithic server running code for many users simultaneously can crash under load |
| Environment Consistency | Different programming languages require different runtimes (JDK, GCC, Python, etc.) which are difficult to maintain on a single server |
| Deployment Complexity | Manually setting up servers, installing dependencies, and deploying updates is error-prone |
| Secret Management | API keys and credentials must never be exposed to the browser |

This project solves all five challenges using Docker containers, a proxy architecture, and cloud-native deployment on Azure.

---

## CHAPTER 3: OBJECTIVES

1. Build a browser-based IDE supporting 9+ programming languages
2. Execute code securely in isolated Docker containers (via JDoodle)
3. Keep API credentials server-side (never exposed to the browser)
4. Containerize the application for consistent deployment
5. Implement CI/CD pipelines using Jenkins and GitHub Actions
6. Deploy to Microsoft Azure for public internet access
7. Demonstrate professional DevOps practices

---

## CHAPTER 4: SYSTEM ARCHITECTURE

### 4.1 High-Level Architecture Diagram

```
+------------------------------------------------------------------+
|                          USER DEVICE                               |
|                                                                    |
|   Browser → React App (Monaco Editor + UI)                         |
|             POST /api/run { script, language, stdin }               |
+-------------------------------+------------------------------------+
                                | HTTPS (port 8080)
                                v
+------------------------------------------------------------------+
|               DOCKER CONTAINER (Azure App Service)                 |
|                                                                    |
|   Node.js + Express (server.js)                                    |
|   |-- GET /           → Serves React bundle (dist/)                |
|   |-- POST /api/run   → Injects JDoodle credentials, forwards     |
|   +-- GET /healthz    → Returns health status                      |
|                                                                    |
|   Environment Variables:                                           |
|   JDOODLE_CLIENT_ID, JDOODLE_CLIENT_SECRET (injected by Azure)     |
+-------------------------------+------------------------------------+
                                | HTTPS
                                v
+------------------------------------------------------------------+
|                        JDOODLE CLOUD                                |
|                                                                    |
|   api.jdoodle.com/v1/execute                                       |
|   |-- Validates credentials                                        |
|   |-- Spins up per-submission Docker container                     |
|   |-- Compiles and runs code with CPU/memory/time limits           |
|   |-- Captures stdout, stderr, exit code                           |
|   +-- Destroys container, returns JSON response                    |
+------------------------------------------------------------------+
```

### 4.2 Deployment Architecture (with Azure)

```
+-----------+       +-----------+       +-------------------+       +----------------+
| Developer |------>|  Jenkins  |------>|  Azure Container  |------>| Azure App      |
| (git push)|       | (CI/CD)  |       |  Registry (ACR)   |       | Service        |
+-----------+       |           |       |                   |       |                |
                    | Build app |       | Store Docker      |       | Run container  |
                    | Build img |       | images            |       | Serve website  |
                    | Push img  |       |                   |       | Public HTTPS   |
                    +-----------+       +-------------------+       +-------+--------+
                                                                            |
                                                                            v
                                                                    https://code-compile-app
                                                                      .azurewebsites.net
```

---

## CHAPTER 5: TECHNOLOGY STACK

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18, Vite, Monaco Editor | Browser-based IDE with syntax highlighting |
| Styling | CSS Variables, Google Fonts (Inter, JetBrains Mono) | Dark/light theme, responsive layout |
| Backend | Node.js 20, Express | Serve static files + API proxy |
| HTTP Client | Axios | Make API requests from browser to server |
| Code Execution | JDoodle Compiler API | Compile and run code in Docker sandboxes |
| Containerization | Docker (multi-stage build) | Package app into a portable image |
| Orchestration | Docker Compose | One-command local deployment |
| CI/CD | Jenkins (Jenkinsfile), GitHub Actions | Automated build, test, and deploy |
| Cloud Platform | Microsoft Azure | Host the application on the internet |
| Version Control | Git + GitHub | Source code management |

---

## CHAPTER 6: SYSTEM DESIGN AND IMPLEMENTATION

### 6.1 Frontend (React Application)

The frontend is a single-page application (SPA) built with React and Vite.

Key files:

| File | Responsibility |
|------|---------------|
| src/App.jsx | Main component, manages all application state |
| src/components/SidePane.jsx | Tabbed Output/Input panel |
| src/components/Header.jsx | Navigation bar with theme toggle |
| src/components/Toolbar.jsx | Run, Clear, Reset, Download buttons |
| src/components/LanguageSelect.jsx | Language dropdown |
| src/components/Icons.jsx | Inline SVG icon library |
| src/languages.js | Language catalog (9 languages with templates) |
| src/runner.js | HTTP client that calls /api/run |
| src/styles/global.css | Complete styling with CSS variables |

Languages supported:

| Language | JDoodle Identifier | Version Index |
|----------|--------------------|---------------|
| JavaScript (Node) | nodejs | 4 |
| Python 3 | python3 | 4 |
| Java | java | 4 |
| C++ (GCC) | cpp17 | 0 |
| C (GCC) | c | 5 |
| C# | csharp | 4 |
| Go | go | 4 |
| Ruby | ruby | 4 |
| PHP | php | 4 |

Key features:
- Monaco Editor with syntax highlighting, bracket matching, word wrap
- Keyboard shortcut: Ctrl/Cmd + Enter to run code
- localStorage persistence (code, language, theme, stdin survive page refresh)
- Tabbed output panel with color-coded stdout (white) and stderr (red)
- Status bar showing language, cursor position, line count, execution time
- Light/dark theme toggle
- Download code as file, reset to template

### 6.2 Backend Proxy Server (Node.js + Express)

The backend is a lightweight Express server (server.js) that serves two purposes:

Purpose 1: Serve the React bundle
- GET / → dist/index.html
- GET /assets/* → dist/assets/* (hashed JS/CSS)
- GET /anything-else → dist/index.html (SPA fallback)

Purpose 2: API proxy with credential injection
- POST /api/run
- Browser sends: { script, stdin, language, versionIndex }
- Server adds: { clientId, clientSecret } from environment variables
- Forwards to: https://api.jdoodle.com/v1/execute
- Returns: { output, statusCode, memory, cpuTime }

Why a proxy?
1. Security — Browser never sees the API credentials
2. CORS — Browser only talks to same-origin (no cross-origin issues)
3. Simplicity — Single container handles everything

### 6.3 Code Execution Engine (JDoodle API)

JDoodle is a third-party code execution service that runs each submission inside an isolated Docker container on their servers.

API endpoint: POST https://api.jdoodle.com/v1/execute

Request body:
```json
{
  "script": "public class Main { ... }",
  "stdin": "",
  "language": "java",
  "versionIndex": "4",
  "clientId": "...",
  "clientSecret": "..."
}
```

Response:
```json
{
  "output": "Hello, Developer!\n",
  "statusCode": 200,
  "memory": "33024",
  "cpuTime": "0.18"
}
```

Security measures by JDoodle:
- Each run gets a fresh Docker container
- CPU time limited (prevents infinite loops)
- Memory limited (prevents memory bombs)
- No network access from inside the sandbox
- Container destroyed after execution

### 6.4 Containerization (Docker)

The application is packaged as a Docker image using a multi-stage build:

Stage 1 — Builder:
- Base image: node:20-alpine
- Installs all dependencies (including dev dependencies)
- Runs vite build to create the production bundle in dist/
- Prunes dev dependencies to shrink the final image

Stage 2 — Runner:
- Base image: node:20-alpine (fresh, clean)
- Copies only: node_modules/, dist/, server.js, package.json
- Exposes port 8080
- Includes health check endpoint
- Runs: node server.js

Image size: ~150 MB (vs ~1 GB if we shipped everything)

docker-compose.yml enables one-command local deployment:
```yaml
services:
  app:
    build: .
    ports:
      - "8080:8080"
    env_file:
      - .env
    restart: unless-stopped
```

### 6.5 CI/CD Pipeline

Jenkins Pipeline (Jenkinsfile):

| Stage | What It Does |
|-------|-------------|
| Checkout | Pulls code from GitHub |
| Install Dependencies | npm install |
| Build | vite build → creates dist/ |
| Docker Build | docker build → creates image tagged for Azure |
| Push to Azure | Pushes image to Azure Container Registry |
| Deploy | Tells Azure App Service to use the new image |

GitHub Actions (.github/workflows/ci.yml):

| Job | What It Does |
|-----|-------------|
| build | Install → build → upload dist/ artifact |
| docker | Build Docker image with Buildx (validates Dockerfile) |

Both pipelines can coexist. Jenkins handles deployment to Azure; GitHub Actions validates every push.

### 6.6 Cloud Deployment (Microsoft Azure)

The application is deployed to Azure using three services (detailed in Chapter 7).

Deployment URL: https://code-compile-app.azurewebsites.net

What Azure provides:
- Public HTTPS URL with free SSL certificate
- Auto-restart on container crash
- Environment variable injection (secrets)
- Health monitoring
- Log streaming
- Scalability (upgrade plan for more CPU/RAM)

---

## CHAPTER 7: AZURE SERVICES USED

| # | Azure Service | Resource Name | Purpose | Cost |
|---|--------------|---------------|---------|------|
| 1 | Resource Group | code-compile-rg | Logical container for all resources | Free |
| 2 | Container Registry (ACR) | codecompileacr | Private Docker image storage | ~$5/month |
| 3 | App Service Plan | code-compile-plan | Linux VM that runs the container (B1 tier: 1 CPU, 1.75 GB RAM) | ~$13/month |
| 4 | Web App (App Service) | code-compile-app | Runs the Docker container, provides public URL | Included in plan |
| 5 | App Settings | (configured on web app) | Injects JDOODLE credentials as environment variables | Free |

Total monthly cost: ~$18/month (or $0 with Azure free $200 credit)

### Service Interaction Diagram

```
+----------------------------------------------------------+
|                 AZURE RESOURCE GROUP                       |
|                 (code-compile-rg)                          |
|                                                           |
|  +------------------+         +------------------------+ |
|  | Container Registry|         | App Service Plan (B1)  | |
|  | (codecompileacr)  |         |                        | |
|  |                   |  pull   |  +------------------+  | |
|  | Stores images:    |-------->|  | Web App          |  | |
|  | online-code-      |         |  | (code-compile-   |  | |
|  | compiler:latest   |         |  |  app)            |  | |
|  |                   |         |  |                  |  | |
|  +------------------+         |  | Runs container   |  | |
|                                |  | on port 8080     |  | |
|                                |  |                  |  | |
|                                |  | ENV:             |  | |
|                                |  | JDOODLE_CLIENT_  |  | |
|                                |  | ID / SECRET      |  | |
|                                |  +--------+---------+  | |
|                                +-----------+------------+ |
|                                            |              |
+--------------------------------------------+--------------+
                                             |
                                             v
                                 https://code-compile-app
                                   .azurewebsites.net
```

---

## CHAPTER 8: DEPLOYMENT WORKFLOW

### Complete End-to-End Flow

```
Step 1:  Developer pushes code to GitHub
Step 2:  Jenkins detects change (webhook or manual Build Now)
Step 3:  Jenkins Stage: Checkout → git clone from GitHub
Step 4:  Jenkins Stage: Install Dependencies → npm install (98 packages)
Step 5:  Jenkins Stage: Build → vite build (creates dist/)
Step 6:  Jenkins Stage: Docker Build → multi-stage image build
Step 7:  Jenkins Stage: Push to Azure → az acr login + docker push
Step 8:  Jenkins Stage: Deploy → az webapp config + restart
Step 9:  Azure App Service pulls new image from ACR
Step 10: Website is live at public URL
```

Total time from push to live: ~3-5 minutes

---

## CHAPTER 9: SECURITY CONSIDERATIONS

| Concern | How It's Addressed |
|---------|-------------------|
| API key exposure | Credentials stored as Azure App Settings (server-side env vars), never in browser bundle |
| Code injection | User code runs in JDoodle's isolated Docker containers, not on our server |
| CORS attacks | Browser only talks to same-origin; no cross-origin requests |
| Brute force | JDoodle handles rate limiting (200 calls/day on free tier) |
| Image tampering | ACR is private; only authenticated Jenkins can push |
| Secrets in git | .gitignore excludes .env and .env.local; only .env.example is committed |
| Container escape | JDoodle containers have no network, capped CPU/memory, and are destroyed after each run |
| HTTPS | Azure App Service provides free SSL certificates automatically |

---

## CHAPTER 10: DEVOPS PRACTICES DEMONSTRATED

| # | Practice | Implementation |
|---|----------|---------------|
| 1 | Version Control | Git + GitHub with conventional commits |
| 2 | Continuous Integration | Jenkins + GitHub Actions verify every push |
| 3 | Continuous Deployment | Jenkins auto-deploys to Azure on success |
| 4 | Infrastructure as Code | Dockerfile, docker-compose.yml, Jenkinsfile |
| 5 | Containerization | Multi-stage Docker build |
| 6 | 12-Factor Config | Environment variables for all configuration |
| 7 | Secret Management | Credentials server-side only (Azure App Settings) |
| 8 | Health Checks | /healthz endpoint + Docker HEALTHCHECK |
| 9 | Reproducible Builds | Pinned base images, npm lockfile |
| 10 | Fail-Fast | Clear error messages when credentials missing |
| 11 | Cloud-Native | Azure App Service + ACR |
| 12 | Documentation as Code | README.md, .env.example, code comments |

---

## CHAPTER 11: RESULTS AND SCREENSHOTS

### 11.1 Supported Languages (Tested Output)

| Language | Input Code | Output |
|----------|-----------|--------|
| Java | System.out.println("Hello"); | Hello |
| Python | print("Hello") | Hello |
| C++ | cout << "Hello"; | Hello |
| C | printf("Hello"); | Hello |
| Go | fmt.Println("Hello") | Hello |
| JavaScript | console.log("Hello") | Hello |
| C# | Console.WriteLine("Hello"); | Hello |
| Ruby | puts "Hello" | Hello |
| PHP | echo "Hello"; | Hello |

### 11.2 Jenkins Pipeline (Successful Build)

```
Stage                    Duration    Status
Checkout                 3s          SUCCESS
Install Dependencies     8s          SUCCESS
Build                    5s          SUCCESS
Docker Build             45s         SUCCESS
Push to Azure            30s         SUCCESS
Deploy                   10s         SUCCESS

Pipeline completed successfully!
Live at: https://code-compile-app.azurewebsites.net
```

### 11.3 Docker Image

```
REPOSITORY                                     TAG      SIZE
codecompileacr.azurecr.io/online-code-compiler latest   152MB
```

---

## CHAPTER 12: FUTURE ENHANCEMENTS

| Enhancement | Description |
|-------------|-------------|
| User authentication | Login with GitHub/Google, save code to user accounts |
| Database integration | Store submission history in Azure Cosmos DB or PostgreSQL |
| Real-time collaboration | Multiple users editing the same file (WebSocket) |
| Auto-scaling | Azure App Service scale-out rules based on CPU/traffic |
| Custom domains | Use a custom domain with Azure DNS |
| Monitoring | Add Azure Application Insights for logs, metrics, tracing |
| Unit testing | Add Vitest test suite, run in CI before deploy |
| Security scanning | Trivy scan on Docker image, npm audit in CI |
| Blue-green deployments | Azure deployment slots for zero-downtime updates |
| More languages | Add Rust, Kotlin, Swift, TypeScript via JDoodle |

---

## CHAPTER 13: CONCLUSION

This project successfully demonstrates the development and deployment of a modern, cloud-native web application using industry-standard DevOps practices. The Online Code Execution Platform:

1. Works — Users can write and execute code in 9 languages with real-time output
2. Is secure — Code runs in isolated containers; credentials never reach the browser
3. Is containerized — A single Docker image packages the entire application
4. Has CI/CD — Jenkins automates building, testing, and deploying
5. Runs on Azure — Publicly accessible with managed HTTPS, health monitoring, and auto-restart
6. Follows DevOps best practices — 12 professional practices demonstrated in a real, working system

The architecture is simple (3 layers, 3 Azure services) yet production-grade. The same patterns scale from a single-developer project to enterprise applications serving millions of users.

---

## CHAPTER 14: REFERENCES

| # | Title | URL |
|---|-------|-----|
| 1 | React Documentation | https://react.dev |
| 2 | Vite Build Tool | https://vitejs.dev |
| 3 | Monaco Editor | https://microsoft.github.io/monaco-editor |
| 4 | JDoodle Compiler API | https://www.jdoodle.com/compiler-api |
| 5 | Docker Documentation | https://docs.docker.com |
| 6 | Docker Multi-Stage Builds | https://docs.docker.com/build/building/multi-stage |
| 7 | Jenkins Pipeline Documentation | https://www.jenkins.io/doc/book/pipeline |
| 8 | GitHub Actions Documentation | https://docs.github.com/en/actions |
| 9 | Azure App Service Documentation | https://learn.microsoft.com/en-us/azure/app-service |
| 10 | Azure Container Registry | https://learn.microsoft.com/en-us/azure/container-registry |
| 11 | Express.js Framework | https://expressjs.com |
| 12 | The Twelve-Factor App Methodology | https://12factor.net |
| 13 | Node.js Documentation | https://nodejs.org/en/docs |
| 14 | Azure CLI Reference | https://learn.microsoft.com/en-us/cli/azure |

---

## APPENDIX A: Project Repository

GitHub: https://github.com/VarunGururani/code-compile

Key files:
```
code-compile/
├── package.json
├── vite.config.js
├── server.js
├── Dockerfile
├── docker-compose.yml
├── Jenkinsfile
├── .github/workflows/ci.yml
├── .env.example
├── index.html
├── public/logo.svg
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── languages.js
    ├── runner.js
    ├── styles/global.css
    └── components/
        ├── Header.jsx
        ├── Toolbar.jsx
        ├── LanguageSelect.jsx
        ├── SidePane.jsx
        └── Icons.jsx
```

---

## APPENDIX B: Azure Setup Commands (Quick Reference)

```powershell
# Login
az login

# Create resources
az group create --name code-compile-rg --location eastus
az provider register --namespace Microsoft.ContainerRegistry
az provider register --namespace Microsoft.Web
az acr create --name codecompileacr --resource-group code-compile-rg --sku Basic --admin-enabled true
az appservice plan create --name code-compile-plan --resource-group code-compile-rg --is-linux --sku B1
az webapp create --resource-group code-compile-rg --plan code-compile-plan --name code-compile-app --deployment-container-image-name codecompileacr.azurecr.io/online-code-compiler:latest

# Configure
az webapp config appsettings set --resource-group code-compile-rg --name code-compile-app --settings JDOODLE_CLIENT_ID=... JDOODLE_CLIENT_SECRET=... PORT=8080 WEBSITES_PORT=8080

# Deploy
az acr login --name codecompileacr
docker build -t codecompileacr.azurecr.io/online-code-compiler:latest .
docker push codecompileacr.azurecr.io/online-code-compiler:latest
az webapp restart --resource-group code-compile-rg --name code-compile-app

# Delete everything
az group delete --name code-compile-rg --yes
```

---

End of Report
