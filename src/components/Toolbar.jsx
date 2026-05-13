function Toolbar({ onRun, onReset, onClearOutput, onDownload, running }) {
  return (
    <div className="toolbar">
      <button className="btn primary" onClick={onRun} disabled={running}>
        {running ? (
          <>
            <span className="spinner" /> Running...
          </>
        ) : (
          <>&#9654; Run</>
        )}
      </button>
      <button className="btn" onClick={onClearOutput} disabled={running}>
        Clear output
      </button>
      <button className="btn" onClick={onReset} disabled={running}>
        Reset code
      </button>
      <button className="btn ghost" onClick={onDownload} disabled={running}>
        Download
      </button>
    </div>
  );
}

export default Toolbar;
