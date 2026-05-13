import Editor from '@monaco-editor/react';
import { useCallback, useEffect, useState } from 'react';

import Header from './components/Header';
import { ClockIcon, CodeIcon, InfoIcon } from './components/Icons';
import LanguageSelect from './components/LanguageSelect';
import SidePane from './components/SidePane';
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
  const [cursorPos, setCursorPos] = useState({ line: 1, column: 1 });

  const langDef = LANGUAGES[language];

  // Persist state
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

  const handleEditorMount = useCallback((editor) => {
    editor.onDidChangeCursorPosition((e) => {
      setCursorPos({
        line: e.position.lineNumber,
        column: e.position.column,
      });
    });
  }, []);

  // Ctrl/Cmd+Enter to run
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

  const lineCount = code.split('\n').length;
  const charCount = code.length;

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
              onMount={handleEditorMount}
              options={{
                fontSize: 14,
                fontFamily:
                  "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
                fontLigatures: false,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
                renderLineHighlight: 'all',
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                padding: { top: 14, bottom: 14 },
                roundedSelection: true,
                scrollbar: {
                  verticalScrollbarSize: 10,
                  horizontalScrollbarSize: 10,
                },
              }}
            />
          </div>
        </section>

        <aside className="side-panel">
          <SidePane
            stdin={stdin}
            onStdinChange={setStdin}
            result={result}
            running={running}
            error={error}
          />
        </aside>
      </main>

      <footer className="status-bar">
        <div className="status-bar-group">
          <span className="status-bar-item">
            <CodeIcon />
            {langDef.label}
          </span>
          <span className="status-bar-divider" />
          <span className="status-bar-item">
            Ln {cursorPos.line}, Col {cursorPos.column}
          </span>
          <span className="status-bar-divider" />
          <span className="status-bar-item">
            {lineCount} lines · {charCount} chars
          </span>
          {result && (
            <>
              <span className="status-bar-divider" />
              <span className="status-bar-item">
                <ClockIcon />
                {result.timeMs} ms
              </span>
            </>
          )}
        </div>

        <div className="status-bar-group">
          <span className="status-bar-item">
            <InfoIcon />
            Press <kbd>Ctrl</kbd>+<kbd>Enter</kbd> to run
          </span>
        </div>
      </footer>
    </div>
  );
}
