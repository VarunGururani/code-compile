import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import https from 'node:https';

const JDOODLE_HOST = 'api.jdoodle.com';
const JDOODLE_PATH = '/v1/execute';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const clientId = env.JDOODLE_CLIENT_ID || '';
  const clientSecret = env.JDOODLE_CLIENT_SECRET || '';

  return {
    plugins: [
      react(),
      {
        // Custom middleware: handles POST /api/run by forwarding to JDoodle
        // with credentials injected on the server side. Avoids the
        // ERR_HTTP_HEADERS_SENT issue you get when reusing http-proxy
        // because we write the request body ourselves.
        name: 'jdoodle-proxy',
        configureServer(server) {
          server.middlewares.use('/api/run', (req, res, next) => {
            if (req.method !== 'POST') {
              return next();
            }

            if (!clientId || !clientSecret) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  error:
                    'JDoodle credentials are not configured. Create .env.local with JDOODLE_CLIENT_ID and JDOODLE_CLIENT_SECRET, then restart the dev server.',
                }),
              );
              return;
            }

            // Buffer the incoming request body
            const chunks = [];
            req.on('data', (chunk) => chunks.push(chunk));
            req.on('end', () => {
              let payload = {};
              try {
                payload = JSON.parse(Buffer.concat(chunks).toString() || '{}');
              } catch {
                payload = {};
              }

              const outgoingBody = JSON.stringify({
                ...payload,
                clientId,
                clientSecret,
              });

              const upstreamReq = https.request(
                {
                  host: JDOODLE_HOST,
                  port: 443,
                  path: JDOODLE_PATH,
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(outgoingBody),
                    Accept: 'application/json',
                  },
                },
                (upstreamRes) => {
                  res.statusCode = upstreamRes.statusCode || 502;
                  // Forward only safe headers
                  const ct = upstreamRes.headers['content-type'];
                  if (ct) res.setHeader('Content-Type', ct);
                  upstreamRes.pipe(res);
                },
              );

              upstreamReq.on('error', (err) => {
                res.statusCode = 502;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: `Upstream error: ${err.message}` }));
              });

              upstreamReq.write(outgoingBody);
              upstreamReq.end();
            });

            req.on('error', () => next());
          });
        },
      },
    ],
    server: {
      host: true,
      port: 5173,
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
  };
});
