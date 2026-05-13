import { GithubIcon, MoonIcon, SunIcon } from './Icons';

function Header({ theme, onToggleTheme }) {
  return (
    <header className="app-header">
      <div className="brand">
        <img src="/logo.svg" alt="Logo" className="brand-logo" />
        <div className="brand-text">
          <h1>Online Code Compiler</h1>
          <p className="tagline">
            Compile and run code in 9 languages — sandboxed via JDoodle
          </p>
        </div>
      </div>

      <div className="header-actions">
        <span className="backend-pill backend-live">
          <span className="dot" />
          Backend ready
        </span>

        <a
          className="icon-btn"
          href="https://github.com/VarunGururani/code-compile"
          target="_blank"
          rel="noopener noreferrer"
          title="View source on GitHub"
          aria-label="View source on GitHub"
        >
          <GithubIcon />
        </a>

        <button
          className="icon-btn"
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  );
}

export default Header;
