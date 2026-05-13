// Production server.
//
// Serves the built React bundle (dist/) AND proxies /api/run to JDoodle
// with credentials injected server-side, so secrets never reach the browser.
//
// Required env vars (passed via docker run -e or docker-compose env_file):
//   JDOODLE_CLIENT_ID
//   JDOODLE_CLIENT_SECRET
//
// Optional:
//   PORT  (default 8080)

import express from 'express';
import https from 'node:https';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = Number(process.env.PORT) || 8080;
const CLIENT_ID = process.env.JDOODLE_CLIENT_ID || '';
const CLIENT_SECRET = process.env.JDOODLE_CLIENT_SECRET || '';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.warn(
    '[server] WARNING: JDOODLE_CLIENT_ID / JDOODLE_CLIENT_SECRET not set. ' +
      'Code execution will fail with a clear error until they are.',
  );
}

const app = express();
app.use(express.json({ limit: '1mb' }));

// Health check
app.get('/healthz', (_req, res) => {
  res.json({ ok: true, hasCreds: Boolean(CLIENT_ID && CLIENT_SECRET) });
});

// Code execution proxy
app.post('/api/run', (req, res) => {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    return res.status(500).json({
      error:
        'JDoodle credentials are not configured. Set JDOODLE_CLIENT_ID and ' +
        'JDOODLE_CLIENT_SECRET environment variables and restart the container.',
    });
  }

  const body = JSON.stringify({
    ...req.body,
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
  });

  const upstream = https.request(
    {
      host: 'api.jdoodle.com',
      port: 443,
      path: '/v1/execute',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        Accept: 'application/json',
      },
    },
    (upstreamRes) => {
      res.status(upstreamRes.statusCode || 502);
      const ct = upstreamRes.headers['content-type'];
      if (ct) res.setHeader('Content-Type', ct);
      upstreamRes.pipe(res);
    },
  );

  upstream.on('error', (err) => {
    console.error('[server] upstream error:', err);
    res.status(502).json({ error: `Upstream error: ${err.message}` });
  });

  upstream.setTimeout(30_000, () => {
    upstream.destroy(new Error('Upstream timeout'));
  });

  upstream.write(body);
  upstream.end();
});

// Static assets
const distDir = path.join(__dirname, 'dist');
app.use(
  express.static(distDir, {
    index: false,
    maxAge: '30d',
    setHeaders: (res, filePath) => {
      // index.html should never be cached so users get fresh bundles
      if (filePath.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    },
  }),
);

// SPA fallback: any non-API GET serves index.html
app.get(/^(?!\/api\/).*/, (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] listening on http://0.0.0.0:${PORT}`);
});
