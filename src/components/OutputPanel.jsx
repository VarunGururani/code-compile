function OutputPanel({ result, running, error }) {
  return (
    <section className="output-panel">
      <header className="output-header">
        <h2>Output</h2>
        {result && (
          <span className={`status-badge ${result.status}`}>
            {result.status === 'success' ? 'Success' : 'Error'} - {result.timeMs} ms
          </span>
        )}
      </header>
      <div className="output-body">
        {running && <pre className="muted">Executing your code...</pre>}
        {!running && error && <pre className="stderr">{error}</pre>}
        {!running && !error && !result && (
          <pre className="muted">Press "Run" to execute your code. Output will appear here.</pre>
        )}
        {!running && result && (
          <>
            {result.stdout && <pre className="stdout">{result.stdout}</pre>}
            {result.stderr && <pre className="stderr">{result.stderr}</pre>}
            {!result.stdout && !result.stderr && (
              <pre className="muted">(No output)</pre>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default OutputPanel;
