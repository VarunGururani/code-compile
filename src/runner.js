// Code execution client.
//
// Talks to JDoodle's compiler API via a Vite dev proxy at /api/run.
// The proxy (vite.config.js) injects JDOODLE_CLIENT_ID and
// JDOODLE_CLIENT_SECRET server-side so they never enter the browser bundle.

import axios from 'axios';

const API_URL = import.meta.env.VITE_EXECUTION_API_URL || '/api/run';

export async function runCode(language, source, stdin) {
  if (!language.jdoodle) {
    throw new Error(`Language "${language.label}" is not supported.`);
  }

  const started = performance.now();

  let data;
  try {
    const response = await axios.post(
      API_URL,
      {
        script: source,
        stdin: stdin || '',
        language: language.jdoodle.language,
        versionIndex: language.jdoodle.versionIndex,
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

  // JDoodle response shape: { output, statusCode, memory, cpuTime, error? }
  // statusCode 200 = success. Anything else = JDoodle-side error.
  if (data?.error) {
    throw new Error(`JDoodle error: ${data.error}`);
  }

  const stdout = (data?.output ?? '').toString();
  const isError = data?.statusCode && data.statusCode !== 200;

  return {
    stdout: isError ? '' : stdout,
    stderr: isError ? stdout : '',
    status: isError ? 'error' : 'success',
    timeMs: Math.round(performance.now() - started),
  };
}
