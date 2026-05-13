import { NavLink } from 'react-router-dom';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';

const items = [
  { to: ROUTES.home, label: 'Bosh', icon: HomeIcon },
  { to: ROUTES.solo, label: 'Solo', icon: SoloIcon },
  { to: ROUTES.battle, label: 'Battle', icon: BattleIcon },
  { to: ROUTES.brain, label: 'Brain', icon: BrainIcon },
  { to: ROUTES.profile, label: 'Profil', icon: ProfileIcon },
] as const;

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 w-full transform-gpu border-t border-black/[0.06] bg-white/85 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2 shadow-[0_-8px_24px_rgb(93_95_239_/8%)] backdrop-blur-xl"
      style={{ backfaceVisibility: 'hidden' }}
    >
      <div className="mx-auto flex max-w-md items-center justify-around px-1">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className="flex min-w-0 flex-1 flex-col items-center gap-0.5 py-1">
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-xl transition-[color,background-color] duration-200 ease-out sm:h-10 sm:w-10 sm:rounded-2xl',
                    isActive ? 'bg-primary-soft text-primary' : 'text-muted',
                  )}
                >
                  <Icon active={isActive} />
                </span>
                <span
                  className={cn(
                    'max-w-full truncate px-0.5 text-[9px] font-semibold sm:text-[10px]',
                    isActive ? 'text-primary' : 'text-muted',
                  )}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden className="sm:h-[22px] sm:w-[22px]">
      <path
        d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={active ? 0.12 : 0}
      />
    </svg>
  );
}

function SoloIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden className="sm:h-[22px] sm:w-[22px]">
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="4"
        stroke="currentColor"
        strokeWidth="2"
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={active ? 0.12 : 0}
      />
      <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function BattleIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden className="sm:h-[22px] sm:w-[22px]">
      <path
        d="M7 21l1-8M17 21l-1-8M9 10h6M12 3v7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="9" cy="10" r="2" fill={active ? 'currentColor' : 'none'} fillOpacity={0.25} />
      <circle cx="15" cy="10" r="2" fill={active ? 'currentColor' : 'none'} fillOpacity={0.25} />
    </svg>
  );
}

function BrainIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden className="sm:h-[22px] sm:w-[22px]">
      <path
        d="M12 4c-2 0-3 1.5-3 3 0 .8.3 1.5.8 2C8 10 7 11.5 7 13c0 1.2.6 2.3 1.5 3-.4.8-.6 1.7-.6 2.6 0 2 1.6 3.4 3.8 3.4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={active ? 0.12 : 0}
      />
      <path
        d="M12 4c2 0 3 1.5 3 3 0 .8-.3 1.5-.8 2 1.8.5 2.8 2 2.8 3.5 0 1.2-.6 2.3-1.5 3 .4.8.6 1.7.6 2.6 0 2-1.6 3.4-3.8 3.4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={active ? 0.12 : 0}
      />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden className="sm:h-[22px] sm:w-[22px]">
      <circle cx="12" cy="9" r="3.5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M6 19c1.5-3 10.5-3 12 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={active ? 0.1 : 0}
      />
    </svg>
  );
}
