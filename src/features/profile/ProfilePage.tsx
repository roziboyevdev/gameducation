import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ClayCard } from '@/shared/ui/ClayCard';
import { SoftButton } from '@/shared/ui/SoftButton';
import { cn } from '@/shared/lib/cn';
import {
  STORAGE_KEYS,
  loadString,
  removeKey,
  saveJson,
  saveString,
} from '@/shared/lib/persistence';
import { validatePlayerName } from '@/shared/lib/validators';
import { useSessionStore } from '@/store/sessionStore';
import { buildProfileSnapshot } from '@/features/profile/profileSnapshot';

export function ProfilePage() {
  const displayName = useSessionStore((s) => s.displayName);
  const setDisplayName = useSessionStore((s) => s.setDisplayName);

  const [draftName, setDraftName] = useState(() => displayName ?? loadString(STORAGE_KEYS.currentUser) ?? '');
  const [nameError, setNameError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);

  useEffect(() => {
    const stored = loadString(STORAGE_KEYS.currentUser);
    setDraftName(displayName ?? stored ?? '');
  }, [displayName]);

  const snapshot = useMemo(() => {
    void dataVersion;
    return buildProfileSnapshot(displayName ?? loadString(STORAGE_KEYS.currentUser));
  }, [displayName, dataVersion]);

  const initials = useMemo(() => avatarInitials(displayName ?? draftName), [displayName, draftName]);

  const persistRefresh = () => setDataVersion((v) => v + 1);

  const handleSaveName = () => {
    const err = validatePlayerName(draftName);
    if (err) {
      setNameError(err);
      return;
    }
    setNameError(null);
    const trimmed = draftName.trim();
    saveString(STORAGE_KEYS.currentUser, trimmed);
    setDisplayName(trimmed);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2000);
  };

  const clearSoloHistory = () => {
    if (!window.confirm('Solo natijalari o‘chirib tashlansinmi?')) return;
    saveJson(STORAGE_KEYS.soloResults, []);
    persistRefresh();
  };

  const clearBrainLb = () => {
    if (!window.confirm('Brain jadvali tozalansinmi?')) return;
    saveJson(STORAGE_KEYS.brainLeaderboard, []);
    persistRefresh();
  };

  const resetProfileLocal = () => {
    if (!window.confirm('Profil ismi va barcha saqlangan natijalar o‘chirilsinmi?')) return;
    removeKey(STORAGE_KEYS.currentUser);
    removeKey(STORAGE_KEYS.soloResults);
    removeKey(STORAGE_KEYS.brainLeaderboard);
    setDisplayName(null);
    setDraftName('');
    persistRefresh();
  };

  const memberHint =
    snapshot.soloLast?.date != null
      ? `Oxirgi Solo: ${snapshot.soloLast.date}`
      : 'Hali tarix yo‘q — Solo dan boshlang';

  return (
    <div className="flex flex-col gap-5 pb-2">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <ClayCard className="relative overflow-hidden p-6 shadow-[var(--shadow-clay)] ring-1 ring-white/70">
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-primary-soft blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-10 h-36 w-36 rounded-full bg-accent-peach/50 blur-2xl" />

          <div className="relative flex flex-col items-center gap-4 text-center">
            <div
              className={cn(
                'flex h-[88px] w-[88px] items-center justify-center rounded-[2rem] text-2xl font-black tracking-tight text-white shadow-[var(--shadow-clay-sm)] ring-4 ring-white/90',
                'bg-gradient-to-br from-primary via-[#7c6fff] to-[#5d9fff]',
              )}
              aria-hidden
            >
              {initials}
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
                Profil
              </p>
              <h1 className="mt-1 text-xl font-extrabold tracking-tight text-text">
                {displayName?.trim() || 'Mehmon o‘yinchi'}
              </h1>
              <p className="mt-1 text-sm text-muted">{memberHint}</p>
            </div>
          </div>
        </ClayCard>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
      >
        <ClayCard className="space-y-4 p-5 ring-1 ring-black/[0.04]">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-text">Ko‘rinadigan ism</h2>
            {savedFlash ? (
              <span className="text-[11px] font-semibold text-emerald-600">Saqlandi</span>
            ) : null}
          </div>
          <p className="text-xs leading-relaxed text-muted">
            Solo va boshqa o‘yinlarda ko‘rinadi. Kamida 2 ta harf, faqat harf va probel.
          </p>
          <input
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            className={cn(
              'w-full rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-sm font-semibold outline-none ring-primary/25 focus:ring-4',
              nameError && 'border-rose-400',
            )}
            placeholder="Ismingizni kiriting"
            autoComplete="name"
          />
          {nameError ? (
            <p className="text-xs font-semibold text-rose-500">⚠ {nameError}</p>
          ) : null}
          <SoftButton className="w-full" onClick={handleSaveName}>
            Saqlash
          </SoftButton>
        </ClayCard>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
      >
        <h2 className="mb-3 px-1 text-sm font-bold text-text">Statistika</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatTile
            label="Solo rekord"
            value={snapshot.soloBestScore != null ? `${snapshot.soloBestScore}/20` : '—'}
            hint={`${snapshot.soloTotalAttempts} ta yozuv`}
            tone="violet"
          />
          <StatTile
            label="Brain rekord"
            value={
              snapshot.brainPersonalBest != null
                ? String(snapshot.brainPersonalBest)
                : snapshot.brainBestScore != null
                  ? String(snapshot.brainBestScore)
                  : '—'
            }
            hint={
              snapshot.brainPersonalBest != null
                ? 'Sizning eng yaxshi ball'
                : snapshot.brainEntriesCount
                  ? 'Umumiy TOP ball'
                  : 'Hali yo‘q'
            }
            tone="mint"
          />
          <StatTile
            label="Oxirgi Solo"
            value={
              snapshot.soloLast ? `${snapshot.soloLast.score}/20` : '—'
            }
            hint={snapshot.soloLast?.diff ?? '—'}
            tone="peach"
            className="col-span-2"
          />
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.14 }}
      >
        <h2 className="mb-3 px-1 text-sm font-bold text-text">Ma’lumotlar</h2>
        <ClayCard className="divide-y divide-black/[0.06] overflow-hidden p-0 ring-1 ring-black/[0.04]">
          <DataRow title="Solo tarixini tozalash" description="Natijalar ro‘yxati o‘chadi" onClick={clearSoloHistory} />
          <DataRow title="Brain jadvalini tozalash" description="Leaderboard yangilanadi" onClick={clearBrainLb} />
          <DataRow
            title="Profilni qayta tiklash"
            description="Ism va barcha natijalar"
            dangerous
            onClick={resetProfileLocal}
          />
        </ClayCard>
      </motion.section>
    </div>
  );
}

function StatTile({
  label,
  value,
  hint,
  tone,
  className,
}: {
  label: string;
  value: string;
  hint: string;
  tone: 'violet' | 'mint' | 'peach';
  className?: string;
}) {
  const bg =
    tone === 'violet'
      ? 'from-accent-lavender/90 to-white'
      : tone === 'mint'
        ? 'from-[#d4f5ea]/95 to-white'
        : 'from-accent-peach/80 to-white';

  return (
    <ClayCard className={cn('space-y-2 p-4 ring-1 ring-white/60', `bg-gradient-to-br ${bg}`, className)}>
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{label}</p>
      <p className="text-xl font-black tracking-tight text-text">{value}</p>
      <p className="text-[11px] font-medium text-muted">{hint}</p>
    </ClayCard>
  );
}

function DataRow({
  title,
  description,
  dangerous,
  onClick,
}: {
  title: string;
  description: string;
  dangerous?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-black/[0.02] active:bg-black/[0.04]"
    >
      <div>
        <p className={cn('text-sm font-bold', dangerous ? 'text-rose-600' : 'text-text')}>{title}</p>
        <p className="mt-0.5 text-xs text-muted">{description}</p>
      </div>
      <span className="shrink-0 text-muted" aria-hidden>
        →
      </span>
    </button>
  );
}

function avatarInitials(raw: string): string {
  const name = raw.trim();
  if (!name) return '?';
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0]!.slice(0, 1);
    const b = parts[1]!.slice(0, 1);
    return `${a}${b}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
