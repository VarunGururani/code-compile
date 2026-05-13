import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// JDoodle execute endpoint
const JDOODLE_EXECUTE_URL = 'https://api.jdoodle.com/v1/execute';

export default defineConfig(({ mode }) => {
  // Read .env files (.env, .env.local, etc.) for both VITE_* and non-VITE vars
  const env = loadEnv(mode, process.cwd(), '');

  const clientId = env.JDOODLE_CLIENT_ID || '';
  const clientSecret = env.JDOODLE_CLIENT_SECRET || '';

  return {
    plugins: [react()],
    server: {
      host: true,
      port: 5173,
      // Proxy /api/run -> JDoodle. We inject the client credentials on the
      // server side so they NEVER reach the browser bundle.
      proxy: {
        '/api/run': {
          target: JDOODLE_EXECUTE_URL,
          changeOrigin: true,
          secure: true,
          // We rewrite to "/" because the proxy already targets the full URL
          rewrite: () => '',
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              if (req.method !== 'POST') return;

              // Read the original body the browser sent us
              const chunks = [];
              req.on('data', (c) => chunks.push(c));
              req.on('end', () => {
                let payload = {};
                try {
                  payload = JSON.parse(Buffer.concat(chunks).toString() || '{}');
                } catch {
                  payload = {};
                }
                // Inject server-side credentials into the body
                const body = JSON.stringify({
                  ...payload,
                  clientId,
                  clientSecret,
                });

                // Replace headers + body before forwarding
                proxyReq.setHeader('Content-Type', 'application/json');
                proxyReq.setHeader('Content-Length', Buffer.byteLength(body));
                proxyReq.write(body);
                proxyReq.end();
              });
            });
          },
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
  };
});
