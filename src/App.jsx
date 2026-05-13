import Editor from '@monaco-editor/react';
import { useCallback, useEffect, useState } from 'react';

import Header from './components/Header';
import LanguageSelect from './components/LanguageSelect';
import OutputPanel from './components/OutputPanel';
import StdinPanel from './components/StdinPanel';
import Toolbar from './components/Toolbar';
import { FILE_EXTENSIONS, LANGUAGES } from './languages';
import { runCode } from './runner';

const STORAGE_KEYS = {
  code: (lang) => `occ:code:${lang}`,
  language: 'occ:language',
  theme: 'occ:theme',
  stdin: 'occ:stdin',
};

function getInitialLanguage() {
  const saved = localStorage.getItem(STORAGE_KEYS.language);
  return saved && LANGUAGES[saved] ? saved : 'javascript';
}

export default function App() {
  const [language, setLanguage] = useState(getInitialLanguage);

  const [code, setCode] = useState(() => {
    const initial = getInitialLanguage();
    const saved = localStorage.getItem(STORAGE_KEYS.code(initial));
    return saved ?? LANGUAGES[initial].template;
  });

  const [stdin, setStdin] = useState(
    () => localStorage.getItem(STORAGE_KEYS.stdin) ?? '',
  );

  const [theme, setTheme] = useState(
    () => localStorage.getItem(STORAGE_KEYS.theme) ?? 'dark',
  );

  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);

  const langDef = LANGUAGES[language];

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.language, language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.code(language), code);
  }, [code, language]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.stdin, stdin);
  }, [stdin]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.theme, theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const handleLanguageChange = useCallback((next) => {
    setLanguage(next);
    setResult(null);
    setError(null);
    const saved = localStorage.getItem(STORAGE_KEYS.code(next));
    setCode(saved ?? LANGUAGES[next].template);
  }, []);

  const handleRun = useCallback(async () => {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await runCode(langDef, code, stdin);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setRunning(false);
    }
  }, [code, stdin, langDef]);

  const handleReset = useCallback(() => {
    setCode(LANGUAGES[language].template);
    setResult(null);
    setError(null);
  }, [language]);

  const handleClearOutput = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  const handleDownload = useCallback(() => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `main.${FILE_EXTENSIONS[language]}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [code, language]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!running) handleRun();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleRun, running]);

  return (
    <div className="app" data-theme={theme}>
      <Header
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      />

      <main className="layout">
        <section className="editor-panel">
          <div className="editor-controls">
            <LanguageSelect
              value={language}
              onChange={handleLanguageChange}
              disabled={running}
            />
            <Toolbar
              onRun={handleRun}
              onReset={handleReset}
              onClearOutput={handleClearOutput}
              onDownload={handleDownload}
              running={running}
            />
          </div>
          <div className="editor-wrapper">
            <Editor
              height="100%"
              language={langDef.monaco}
              theme={theme === 'dark' ? 'vs-dark' : 'vs'}
              value={code}
              onChange={(v) => setCode(v ?? '')}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
                renderLineHighlight: 'all',
                smoothScrolling: true,
              }}
            />
          </div>
        </section>

        <aside className="side-panel">
          <StdinPanel value={stdin} onChange={setStdin} />
          <OutputPanel result={result} running={running} error={error} />
        </aside>
      </main>

      <footer className="app-footer">
        <span>
          Tip: press <kbd>Ctrl</kbd>+<kbd>Enter</kbd> to run. Code is executed in
          isolated Docker sandboxes on the server.
        </span>
      </footer>
    </div>
  );
}
