import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ClayCard } from '@/shared/ui/ClayCard';
import { SoftButton } from '@/shared/ui/SoftButton';
import { launchConfettiCanvas } from '@/shared/lib/confetti';
import { cn } from '@/shared/lib/cn';
import { useSoloGame } from '@/features/solo-math/useSoloGame';
import type { SoloResultEntry } from '@/features/solo-math/soloLogic';

export function SoloMathPage() {
  const g = useSoloGame();
  const confettiRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (g.phase !== 'result' || !g.grade || g.grade.pct < 0.8) return;
    const canvas = confettiRef.current;
    if (!canvas) return;
    const colors = ['#5d5fef', '#a78bfa', '#22d3ee', '#f59e0b', '#34c759', '#f43f5e'];
    return launchConfettiCanvas(canvas, colors);
  }, [g.phase, g.grade]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return;
      if (g.phase === 'menu') g.startTest();
      if (g.phase === 'game') g.submitAnswer();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [g]);

  const qText =
    g.phase === 'game' && g.current < g.soloTotal ? `${g.questions[g.current]?.q ?? ''} = ?` : '';

  return (
    <div className="relative pb-4">
      <canvas ref={confettiRef} className="pointer-events-none fixed inset-0 z-[60]" />

      {g.phase === 'menu' ? (
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <ClayCard className="space-y-4 p-5">
            <h1 className="text-xl font-extrabold text-text">SOLO MATH</h1>
            <p className="text-sm text-muted">20 ta savol, taymer bilan.</p>
            <label className="block text-xs font-semibold text-muted">Ismingiz</label>
            <input
              value={g.playerName}
              onChange={(e) => g.setPlayerName(e.target.value)}
              className={cn(
                'w-full rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-sm font-medium outline-none ring-primary/25 transition-shadow focus:ring-4',
                g.nameError && 'border-rose-400',
              )}
              placeholder="Masalan: Ali"
            />
            {g.nameError ? <p className="text-xs font-semibold text-rose-500">⚠ {g.nameError}</p> : null}

            <div>
              <p className="mb-2 text-xs font-semibold text-muted">Qiyinchilik</p>
              <div className="flex flex-wrap gap-2">
                {(['easy', 'medium', 'hard'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => g.setDifficulty(d)}
                    className={cn(
                      'rounded-full px-4 py-2 text-xs font-bold transition-colors',
                      g.difficulty === d
                        ? 'bg-primary text-white shadow-[var(--shadow-clay-sm)]'
                        : 'bg-surface-muted text-muted hover:bg-black/[0.04]',
                    )}
                  >
                    {d === 'easy' ? 'Oson' : d === 'medium' ? "O'rta" : 'Qiyin'}
                  </button>
                ))}
              </div>
            </div>

            <SoftButton className="w-full" onClick={g.startTest}>
              Boshlash
            </SoftButton>
          </ClayCard>

          <SoloLeaderboardCard
            entries={g.history}
            totalQuestions={g.soloTotal}
            onClear={g.clearResults}
            heading="Oxirgi natijalar"
            subheading="Oxirgi 10 ta urinish"
            emptyLabel="Hali natija yo‘q"
          />
        </motion.section>
      ) : null}

      {g.phase === 'game' ? (
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <ClayCard className="space-y-4 p-5">
            <div className="flex items-center justify-between text-xs font-semibold text-muted">
              <span>{g.playerName}</span>
              <span>
                {g.current + 1} / {g.soloTotal}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-black/[0.06]">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300"
                style={{ width: `${(g.current / g.soloTotal) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="relative h-16 w-16 shrink-0">
                <svg viewBox="0 0 72 72" className="-rotate-90">
                  <circle cx="36" cy="36" r="32" stroke="currentColor" strokeWidth="8" fill="none" className="text-black/[0.06]" />
                  <circle
                    cx="36"
                    cy="36"
                    r="32"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={201}
                    strokeDashoffset={g.ringDashoffset}
                    strokeLinecap="round"
                    className={g.timerStroke}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-text">
                  {g.timeLeft}
                </span>
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-2xl font-extrabold tracking-tight text-text">{qText}</p>
                <p className="text-xs text-muted">
                  To‘g‘ri: <b className="text-text">{g.score}</b> · Xato:{' '}
                  <b className="text-text">{g.wrongCount}</b>
                </p>
              </div>
            </div>

            <input
              value={g.answerInput}
              onChange={(e) => g.setAnswerInput(e.target.value)}
              className={cn(
                'w-full rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-lg font-bold tracking-wide outline-none ring-primary/25 focus:ring-4',
                g.inputStatus === 'correct' && 'border-emerald-400 ring-emerald-200',
                g.inputStatus === 'wrong' && 'border-rose-400 ring-rose-200',
              )}
              inputMode="numeric"
              autoFocus
            />

            {g.feedback ? (
              <p
                className={cn(
                  'text-center text-sm font-bold',
                  g.feedback.ok ? 'text-emerald-600' : 'text-rose-600',
                )}
              >
                {g.feedback.msg}
              </p>
            ) : null}

            <SoftButton className="w-full" onClick={g.submitAnswer}>
              Javobni yuborish
            </SoftButton>
          </ClayCard>
        </motion.section>
      ) : null}

      {g.phase === 'result' && g.grade ? (
        <motion.section initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          <ClayCard className="space-y-3 p-6 text-center">
            <div className="text-5xl">{g.grade.icon}</div>
            <h2 className="text-xl font-extrabold text-text">{g.playerName}</h2>
            <p className="text-sm font-semibold text-primary">
              {g.score} / {g.soloTotal} to‘g‘ri
            </p>
            <p className="text-sm leading-relaxed text-muted">{g.grade.grade}</p>
            <div className="flex flex-col gap-2 pt-2">
              <SoftButton onClick={g.restartQuick}>Qayta topshirish</SoftButton>
              <SoftButton variant="ghost" onClick={g.restartFromMenu}>
                Menyu
              </SoftButton>
            </div>
          </ClayCard>

          <SoloLeaderboardCard
            entries={g.history}
            totalQuestions={g.soloTotal}
            onClear={g.clearResults}
            heading="Tarix"
            subheading={null}
            emptyLabel="Bo‘sh"
            compactHeader
          />
        </motion.section>
      ) : null}
    </div>
  );
}

const lbContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.055 } },
};

const lbRowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 420, damping: 30 },
  },
};

function difficultyPillClass(diff: string) {
  if (diff === 'Oson') {
    return 'bg-emerald-50 text-emerald-900 ring-emerald-300/45';
  }
  if (diff === "O'rta") {
    return 'bg-amber-50 text-amber-900 ring-amber-300/45';
  }
  if (diff === 'Qiyin') {
    return 'bg-rose-50 text-rose-900 ring-rose-300/45';
  }
  return 'bg-slate-100 text-slate-700 ring-black/[0.06]';
}

function rankBadgeClass(index: number) {
  if (index === 0) {
    return 'bg-gradient-to-br from-amber-100 to-amber-50 text-amber-950 ring-amber-300/55 shadow-[0_2px_8px_-2px_rgb(245_158_11_/28%)]';
  }
  if (index === 1) {
    return 'bg-gradient-to-br from-slate-200 to-slate-100 text-slate-800 ring-slate-300/50';
  }
  if (index === 2) {
    return 'bg-gradient-to-br from-orange-100 to-orange-50 text-orange-950 ring-orange-300/45';
  }
  return 'bg-surface-muted text-muted ring-black/[0.05]';
}

function TrophyGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 1 1-10 0V4z" />
      <path d="M7 4H5a2 2 0 0 0-2 2v1c0 1.5 1.1 2.7 2.5 2.9M17 4h2a2 2 0 0 1 2 2v1c0 1.5-1.1 2.7-2.5 2.9" />
    </svg>
  );
}

function SoloLeaderboardCard({
  entries,
  totalQuestions,
  onClear,
  heading,
  subheading,
  emptyLabel,
  compactHeader,
}: {
  entries: SoloResultEntry[];
  totalQuestions: number;
  onClear: () => void;
  heading: string;
  subheading: string | null;
  emptyLabel: string;
  compactHeader?: boolean;
}) {
  return (
    <ClayCard className="relative overflow-hidden p-5">
      <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-gradient-to-br from-[#ececfe]/95 to-transparent blur-2xl" />
      <div className="pointer-events-none absolute -bottom-14 -left-10 h-36 w-36 rounded-full bg-gradient-to-tr from-[#ffd8cc]/40 to-transparent blur-2xl" />

      <div className="relative z-[1]">
        {compactHeader ? (
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-extrabold tracking-tight text-text">{heading}</h2>
            <button
              type="button"
              onClick={onClear}
              className="shrink-0 rounded-full px-3 py-1.5 text-xs font-bold text-primary shadow-[inset_0_1px_0_rgb(255_255_255/60%)] ring-1 ring-primary/20 transition hover:bg-primary-soft active:scale-[0.98]"
            >
              Tozalash
            </button>
          </div>
        ) : (
          <div className="mb-5 flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ececfe] via-[#e0e7ff] to-[#c7d2fe] text-primary shadow-[inset_0_1px_0_rgb(255_255_255/75%),0_6px_16px_rgb(93_95_239_/14%)] ring-1 ring-white/80">
                <TrophyGlyph className="text-indigo-600" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-extrabold leading-tight tracking-tight text-text">{heading}</h2>
                {subheading ? <p className="mt-0.5 text-[11px] font-medium text-muted">{subheading}</p> : null}
              </div>
            </div>
            <button
              type="button"
              onClick={onClear}
              className="shrink-0 rounded-full px-3.5 py-2 text-xs font-bold text-primary shadow-[inset_0_1px_0_rgb(255_255_255/60%)] ring-1 ring-primary/20 transition hover:bg-primary-soft active:scale-[0.98]"
            >
              Tozalash
            </button>
          </div>
        )}

        {entries.length === 0 ? (
          <div className="flex flex-col items-center gap-2.5 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-surface-muted to-white text-xl shadow-[inset_0_1px_0_rgb(255_255_255/80%)] ring-1 ring-black/[0.05]">
              📊
            </div>
            <p className="text-sm font-semibold text-muted">{emptyLabel}</p>
            {heading === 'Oxirgi natijalar' ? (
              <p className="max-w-[14rem] text-[11px] leading-relaxed text-muted/90">
                Birinchi urinishdan keyin natijalar shu yerda turadi.
              </p>
            ) : null}
          </div>
        ) : (
          <motion.ul
            className="space-y-2.5"
            variants={lbContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {entries.map((r, i) => (
              <motion.li
                key={`${r.name}-${r.date}-${i}`}
                variants={lbRowVariants}
                className={cn(
                  'grid grid-cols-[2.25rem_minmax(0,1fr)_auto_auto] items-center gap-x-2 gap-y-1 rounded-[1.1rem] border border-black/[0.06] bg-gradient-to-r from-white via-white to-surface-muted/50 px-2.5 py-2.5 shadow-[inset_0_1px_0_rgb(255_255_255/95%),0_3px_12px_-6px_rgb(17_24_39_/14%)] sm:gap-x-3 sm:px-3',
                  i === 0 && 'border-primary/18 ring-1 ring-primary/12',
                )}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-xl text-[11px] font-extrabold tabular-nums ring-1',
                    rankBadgeClass(i),
                  )}
                >
                  {i + 1}
                </span>
                <span className="min-w-0 truncate text-[13px] font-bold text-text sm:text-sm">{r.name}</span>
                <span
                  className={cn(
                    'rounded-full px-2 py-[5px] text-center text-[10px] font-bold uppercase tracking-wide ring-1',
                    difficultyPillClass(r.diff),
                  )}
                >
                  {r.diff}
                </span>
                <span className="rounded-xl bg-gradient-to-br from-primary-soft to-white px-2.5 py-1 text-right text-xs font-extrabold tabular-nums text-primary ring-1 ring-primary/18 shadow-[inset_0_1px_0_rgb(255_255_255/90%)]">
                  {r.score}/{totalQuestions}
                </span>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </div>
    </ClayCard>
  );
}
