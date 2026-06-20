import { Link, NavLink } from 'react-router-dom';

export default function PublicNavbar() {
  const navLinkClass = ({ isActive }) =>
    `text-sm transition-colors ${
      isActive ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
    }`;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[var(--bg-base)]/80 border-b border-[var(--border-subtle)]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-md bg-[var(--accent)] flex items-center justify-center font-display font-bold text-[var(--bg-base)] text-sm">
            H
          </span>
          <span className="font-display font-semibold text-[15px] tracking-tight">
            HostelMarket
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <NavLink to="/" className={navLinkClass} end>Home</NavLink>
          <NavLink to="/about" className={navLinkClass}>About</NavLink>
          <NavLink to="/mission" className={navLinkClass}>Mission</NavLink>
          <NavLink to="/how-it-works" className={navLinkClass}>How it works</NavLink>
          <NavLink to="/faq" className={navLinkClass}>FAQ</NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-3 py-2"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="text-sm font-medium px-4 py-2 rounded-[var(--radius-sm)] bg-[var(--accent)] text-[var(--bg-base)] hover:bg-[var(--accent-dim)] transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}
