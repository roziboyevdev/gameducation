import { Link, NavLink } from 'react-router-dom';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/[0.05] bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <Link to={ROUTES.home} className="flex items-center gap-2 font-extrabold tracking-tight">
          <span className="rounded-xl bg-primary px-2 py-1 text-xs font-bold uppercase tracking-widest text-white shadow-[var(--shadow-clay-sm)]">
            GE
          </span>
          <span className="text-lg text-text">
            GAME<span className="text-primary">DU</span>CATION
          </span>
        </Link>
        <NavLink
          to={ROUTES.profile}
          className={({ isActive }) =>
            cn(
              'flex h-10 w-10 items-center justify-center rounded-2xl ring-1 ring-black/[0.05] transition-colors',
              isActive ? 'bg-primary-soft text-primary' : 'bg-surface-muted text-muted',
            )
          }
          aria-label="Profil"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="9" r="4" stroke="currentColor" strokeWidth="2" />
            <path
              d="M6 19c1.5-3 10.5-3 12 0"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </NavLink>
      </div>
    </header>
  );
}
