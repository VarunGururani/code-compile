// Code execution client.
//
// In dev, requests go to /api/run which Vite proxies to
// https://api.codex.jaagrav.in (see vite.config.js). The proxy avoids
// browser CORS issues when the upstream API does not send the right headers.
//
// You can override the URL with VITE_EXECUTION_API_URL (e.g. point it at
// your own self-hosted CodeX or Piston instance).

import axios from 'axios';

const API_URL = import.meta.env.VITE_EXECUTION_API_URL || '/api/run';

export async function runCode(language, source, stdin) {
  if (!language.codex) {
    throw new Error(`Language "${language.label}" is not supported.`);
  }

  const started = performance.now();

  let data;
  try {
    const response = await axios.post(
      API_URL,
      {
        code: source,
        language: language.codex,
        input: stdin || '',
      },
      {
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' },
      },
    );
    data = response.data;
  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      throw new Error('Request timed out. The execution took too long.');
    }
    if (err.response) {
      const msg = err.response.data?.error || err.response.data?.message || err.message;
      throw new Error(`Backend returned ${err.response.status}: ${msg}`);
    }
    throw new Error(
      `Network error: ${err.message}. ` +
        'Make sure the dev server is running (npm run dev) ' +
        'so the /api/run proxy is active.',
    );
  }

  // CodeX returns: { output, error, language, info, timeStamp }
  const stdout = (data.output || '').toString();
  const stderr = (data.error || '').toString();
  const hasError = Boolean(stderr) && stderr.trim().length > 0;

  return {
    stdout,
    stderr,
    status: hasError ? 'error' : 'success',
    timeMs: Math.round(performance.now() - started),
  };
}
