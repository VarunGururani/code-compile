import { DownloadIcon, PlayIcon, RotateIcon, TrashIcon } from './Icons';

function Toolbar({ onRun, onReset, onClearOutput, onDownload, running }) {
  return (
    <div className="toolbar">
      <button
        className="btn primary"
        onClick={onRun}
        disabled={running}
        title="Run (Ctrl/Cmd+Enter)"
      >
        {running ? (
          <>
            <span className="spinner" />
            <span>Running</span>
          </>
        ) : (
          <>
            <PlayIcon />
            <span>Run</span>
          </>
        )}
      </button>

      <button
        className="btn"
        onClick={onClearOutput}
        disabled={running}
        title="Clear output"
      >
        <TrashIcon />
        <span>Clear</span>
      </button>

      <button
        className="btn"
        onClick={onReset}
        disabled={running}
        title="Reset code to template"
      >
        <RotateIcon />
        <span>Reset</span>
      </button>

      <button
        className="btn ghost"
        onClick={onDownload}
        disabled={running}
        title="Download as file"
      >
        <DownloadIcon />
        <span>Download</span>
      </button>
    </div>
  );
}

export default Toolbar;
