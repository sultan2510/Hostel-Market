import { Link } from 'react-router-dom';

export default function PublicFooter() {
  return (
    <footer className="border-t border-[var(--border-subtle)] mt-24">
      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row md:items-start justify-between gap-10">
        <div className="max-w-xs">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-md bg-[var(--accent)] flex items-center justify-center font-display font-bold text-[var(--bg-base)] text-xs">
              H
            </span>
            <span className="font-display font-semibold text-sm">HostelMarket</span>
          </div>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            Built for hostellites, by hostellites. Buy and sell within your own
            residential blocks — verified, local, no strangers at your gate.
          </p>
        </div>

        <div className="flex gap-12">
          <div>
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">
              Platform
            </p>
            <div className="flex flex-col gap-2 text-sm text-[var(--text-secondary)]">
              <Link to="/about" className="hover:text-[var(--text-primary)]">About us</Link>
              <Link to="/mission" className="hover:text-[var(--text-primary)]">Mission</Link>
              <Link to="/how-it-works" className="hover:text-[var(--text-primary)]">How it works</Link>
              <Link to="/faq" className="hover:text-[var(--text-primary)]">FAQ</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">
              Get started
            </p>
            <div className="flex flex-col gap-2 text-sm text-[var(--text-secondary)]">
              <Link to="/signup" className="hover:text-[var(--text-primary)]">Sign up</Link>
              <Link to="/login" className="hover:text-[var(--text-primary)]">Log in</Link>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 py-6 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
        © {new Date().getFullYear()} HostelMarket. A closed-loop marketplace for verified hostel residents.
      </div>
    </footer>
  );
}
