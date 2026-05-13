// Code execution client.
//
// Uses the free CodeX API (https://github.com/Jaagrav/CodeX) which runs
// each submission in an isolated Docker container on the server side.
// No API key, no signup, no setup.
//
// You can override the endpoint at build time with:
//   VITE_EXECUTION_API_URL=https://your-self-hosted-instance

import axios from 'axios';

const DEFAULT_API = 'https://api.codex.jaagrav.in';
const API_URL = import.meta.env.VITE_EXECUTION_API_URL || DEFAULT_API;

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
      `Network error: ${err.message}. Check your internet connection.`,
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
