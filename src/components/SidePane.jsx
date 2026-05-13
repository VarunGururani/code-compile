import { useState } from 'react';
import { AlertIcon, FileTextIcon, TerminalIcon } from './Icons';

function SidePane({ stdin, onStdinChange, result, running, error }) {
  const [tab, setTab] = useState('output');

  const stdinLines = stdin ? stdin.split('\n').length : 0;

  return (
    <section className="side-pane">
      <div className="tabs" role="tablist">
        <button
          className={`tab ${tab === 'output' ? 'active' : ''}`}
          onClick={() => setTab('output')}
          role="tab"
          aria-selected={tab === 'output'}
        >
          <TerminalIcon />
          <span>Output</span>
        </button>
        <button
          className={`tab ${tab === 'input' ? 'active' : ''}`}
          onClick={() => setTab('input')}
          role="tab"
          aria-selected={tab === 'input'}
        >
          <FileTextIcon />
          <span>Input</span>
          {stdinLines > 0 && <span className="badge">{stdinLines}</span>}
        </button>

        {tab === 'output' && result && (
          <span className={`status-badge ${result.status}`}>
            {result.status === 'success' ? 'Success' : 'Error'} · {result.timeMs}ms
          </span>
        )}
      </div>

      {tab === 'output' && (
        <div className="pane-body">
          {error && (
            <div className="error-banner">
              <AlertIcon />
              <span>{error}</span>
            </div>
          )}

          {running && (
            <div className="loading-state">
              <span className="spinner" />
              <span>Executing your code…</span>
            </div>
          )}

          {!running && !error && !result && (
            <div className="empty-state">
              <TerminalIcon />
              <div className="empty-state-text">No output yet</div>
              <div className="empty-state-hint">
                Press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> or click Run
              </div>
            </div>
          )}

          {!running && result && (
            <div className="output-body">
              {result.stdout && <pre className="stdout">{result.stdout}</pre>}
              {result.stderr && <pre className="stderr">{result.stderr}</pre>}
              {!result.stdout && !result.stderr && (
                <pre className="muted">(No output)</pre>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'input' && (
        <div className="pane-body">
          <textarea
            className="stdin-textarea"
            value={stdin}
            onChange={(e) => onStdinChange(e.target.value)}
            placeholder="Type input here. It will be piped to your program's stdin..."
            spellCheck={false}
          />
        </div>
      )}
    </section>
  );
}

export default SidePane;
