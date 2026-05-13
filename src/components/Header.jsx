function Header({ theme, onToggleTheme }) {
  return (
    <header className="app-header">
      <div className="brand">
        <img src="/logo.svg" alt="Logo" className="brand-logo" />
        <div>
          <h1>Online Code Compiler</h1>
          <p className="tagline">
            Write, compile and run code in your browser - powered by React and Docker-isolated execution.
          </p>
        </div>
      </div>
      <div className="header-actions">
        <span className="backend-pill backend-live">
          <span className="dot" />
          Execution backend: ready
        </span>
        <button className="btn ghost" onClick={onToggleTheme} title="Toggle theme">
          {theme === 'dark' ? 'Light' : 'Dark'} mode
        </button>
      </div>
    </header>
  );
}

export default Header;
