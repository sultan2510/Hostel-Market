import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AppNavbar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate('/');
  }

  const navLinkClass = ({ isActive }) =>
    `text-sm transition-colors ${
      isActive ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
    }`;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[var(--bg-base)]/80 border-b border-[var(--border-subtle)]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/app" className="flex items-center gap-2 shrink-0">
          <span className="w-7 h-7 rounded-md bg-[var(--accent)] flex items-center justify-center font-display font-bold text-[var(--bg-base)] text-sm">
            H
          </span>
          <span className="font-display font-semibold text-[15px] tracking-tight hidden sm:inline">
            HostelMarket
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <NavLink to="/app" className={navLinkClass} end>
            Browse
          </NavLink>
          <NavLink to="/app/create-listing" className={navLinkClass}>
            Sell an item
          </NavLink>
          <NavLink to="/app/profile" className={navLinkClass}>
            My listings
          </NavLink>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm text-[var(--text-secondary)] hidden md:inline">
            {profile?.full_name}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm px-3 py-2 rounded-[var(--radius-sm)] border border-[var(--border-strong)] hover:border-[var(--accent)] transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
