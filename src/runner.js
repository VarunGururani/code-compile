// Code execution client.
// Uses the public Piston API (https://github.com/engineer-man/piston) which
// runs each submission inside an isolated Docker container.
// No API key, no setup needed.

import axios from 'axios';

const PISTON_API = 'https://emkc.org/api/v2/piston';

export async function runCode(language, source, stdin) {
  if (!language.piston) {
    throw new Error(`Language "${language.label}" is not supported.`);
  }

  const started = performance.now();

  let data;
  try {
    const response = await axios.post(
      `${PISTON_API}/execute`,
      {
        language: language.piston.language,
        version: language.piston.version,
        files: [{ name: 'main', content: source }],
        stdin: stdin || '',
      },
      { timeout: 30000 },
    );
    data = response.data;
  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      throw new Error('Request timed out. The execution took too long.');
    }
    if (err.response) {
      throw new Error(
        `Backend returned ${err.response.status}: ${err.response.data?.message || err.message}`,
      );
    }
    throw new Error(
      `Network error: ${err.message}. Check your internet connection.`,
    );
  }

  const compileErr = data.compile?.stderr || '';
  const runStdout = data.run?.stdout || '';
  const runStderr = data.run?.stderr || '';
  const exitCode = data.run?.code ?? 0;
  const hasError = exitCode !== 0 || compileErr.length > 0;

  return {
    stdout: runStdout,
    stderr: [compileErr, runStderr].filter(Boolean).join('\n'),
    status: hasError ? 'error' : 'success',
    timeMs: Math.round(performance.now() - started),
    exitCode,
  };
}
