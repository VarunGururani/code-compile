# syntax=docker/dockerfile:1.7

# ---- Stage 1: Build the React bundle ---------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm \
    npm install --no-audit --no-fund

COPY . .
RUN npm run build

# Prune dev dependencies for the runtime image (keep express etc.)
RUN npm prune --omit=dev

# ---- Stage 2: Production runtime (Node + Express) --------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copy production node_modules and the built bundle
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/package.json ./package.json

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -q -O- http://localhost:8080/healthz || exit 1

CMD ["node", "server.js"]
