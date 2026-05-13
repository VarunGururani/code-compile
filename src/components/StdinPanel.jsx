function StdinPanel({ value, onChange }) {
  return (
    <section className="stdin-panel">
      <header className="stdin-header">
        <h2>Standard input</h2>
        <span className="muted small">Piped to your program's stdin</span>
      </header>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Optional input passed to stdin..."
        spellCheck={false}
      />
    </section>
  );
}

export default StdinPanel;
