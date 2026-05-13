import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClayCard } from '@/shared/ui/ClayCard';
import { SoftButton } from '@/shared/ui/SoftButton';
import { cn } from '@/shared/lib/cn';
import { BRAIN_MODES, type BrainMode } from '@/features/brain-memory/brainLogic';
import { useBrainGame } from '@/features/brain-memory/useBrainGame';

export function BrainMemoryPage() {
  const g = useBrainGame();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return;
      if (g.phase === 'menu') g.initGame();
      else if (g.phase === 'game') g.keyEnter();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [g]);

  return (
    <div className="pb-4">
      {g.phase === 'menu' ? (
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <ClayCard className="space-y-4 p-5">
            <h1 className="text-xl font-extrabold text-text">BRAIN</h1>
            <p className="text-sm text-muted">Sonlarni eslab qoling va ularni qo‘shing.</p>

            <label className="block text-xs font-semibold text-muted">Ismingiz</label>
            <input
              value={g.playerName}
              onChange={(e) => g.setPlayerName(e.target.value)}
              className={cn(
                'w-full rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-primary/25',
                g.nameError && 'border-rose-400',
              )}
            />
            {g.nameError ? <p className="text-xs font-semibold text-rose-500">⚠ {g.nameError}</p> : null}

            <div>
              <p className="mb-2 text-xs font-semibold text-muted">Rejim</p>
              <div className="grid gap-2">
                {(['easy', 'medium', 'hard'] as BrainMode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => g.setMode(m)}
                    className={cn(
                      'rounded-2xl border px-4 py-3 text-left transition-colors',
                      g.mode === m
                        ? 'border-primary bg-primary-soft shadow-[var(--shadow-clay-sm)]'
                        : 'border-black/[0.06] bg-white',
                    )}
                  >
                    <span className="block text-sm font-bold text-text">{BRAIN_MODES[m].label}</span>
                    <span className="text-xs text-muted">
                      {BRAIN_MODES[m].numCount} ta son · {(BRAIN_MODES[m].showTimeMs / 1000).toFixed(1)}s
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <SoftButton className="w-full" onClick={g.initGame}>
              O‘yinga kirish
            </SoftButton>
          </ClayCard>

          <ClayCard className="flex items-center justify-between p-4">
            <span className="text-sm font-bold text-text">Leaderboard</span>
            <button type="button" className="text-xs font-semibold text-primary" onClick={g.clearLb}>
              Tozalash
            </button>
          </ClayCard>

          <LbList entries={g.leaderboardEntries} />
        </motion.section>
      ) : null}

      {g.phase === 'game' ? (
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <ClayCard className="space-y-4 p-5">
            <div className="flex flex-wrap justify-between gap-2 text-xs font-semibold text-muted">
              <span>{g.playerName}</span>
              <span>
                Ball: <b className="text-primary">{g.score}</b>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-semibold">
              <Stat label="To‘g‘ri" value={g.correctCount} />
              <Stat label="Streak" value={g.streak} />
              <Stat label="Rekord" value={g.bestStreak} />
            </div>

            <div
              className={cn(
                'flex min-h-[120px] items-center justify-center rounded-[var(--radius-clay-lg)] text-3xl font-black tracking-wide transition-opacity duration-300',
                'bg-gradient-to-br from-accent-lavender via-white to-accent-peach shadow-inner ring-1 ring-black/[0.05]',
                g.numsState === 'fading' && 'opacity-40',
                g.numsState === 'question' && 'text-primary',
              )}
            >
              {g.numsLabel}
            </div>

            {g.feedback ? (
              <p
                className={cn(
                  'rounded-2xl px-3 py-2 text-center text-sm font-bold',
                  g.feedback.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700',
                )}
              >
                {g.feedback.msg}
              </p>
            ) : null}

            {g.showAnswerRow ? (
              <div className="space-y-3">
                <input
                  value={g.answerInput}
                  onChange={(e) => g.setAnswerInput(e.target.value)}
                  className={cn(
                    'w-full rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-xl font-bold outline-none focus:ring-4 focus:ring-primary/25',
                    g.answerCls === 'correct' && 'border-emerald-400',
                    g.answerCls === 'wrong' && 'border-rose-400',
                  )}
                  inputMode="numeric"
                  autoFocus
                />
                <div className="space-y-1">
                  <div className="h-2 overflow-hidden rounded-full bg-black/[0.06]">
                    <div
                      className={cn(
                        'h-full rounded-full transition-[width] duration-100',
                        g.timerPct > 0.5 ? 'bg-primary' : g.timerPct > 0.25 ? 'bg-amber-400' : 'bg-rose-500',
                      )}
                      style={{ width: `${g.timerPct * 100}%` }}
                    />
                  </div>
                  <p className="text-center text-xs font-bold text-muted">{g.timerLabel}</p>
                </div>
                <SoftButton className="w-full" onClick={g.checkAnswer}>
                  Javob berish
                </SoftButton>
              </div>
            ) : (
              <SoftButton className="w-full" variant="ghost" onClick={g.nextRound}>
                {g.goLabel}
              </SoftButton>
            )}

            <SoftButton variant="white" className="w-full" onClick={g.finishSession}>
              Sessiyani yakunlash
            </SoftButton>
          </ClayCard>
        </motion.section>
      ) : null}

      {g.phase === 'leaderboard' && g.sessionSummary ? (
        <motion.section initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          <ClayCard className="space-y-3 p-6 text-center">
            <div className="text-5xl">{g.sessionSummary.icon}</div>
            <h2 className="text-xl font-extrabold">{g.playerName}</h2>
            <p className="text-lg font-bold text-primary">{g.score} ball</p>
            <p className="text-sm text-muted">{g.sessionSummary.grade}</p>
            <div className="flex flex-col gap-2 pt-2">
              <SoftButton onClick={g.playAgain}>Qayta</SoftButton>
              <SoftButton variant="ghost" onClick={g.goMenu}>
                Menyu
              </SoftButton>
            </div>
          </ClayCard>

          <ClayCard className="p-4">
            <div className="mb-2 flex justify-between">
              <span className="text-sm font-bold">Umumiy</span>
              <button type="button" className="text-xs font-semibold text-primary" onClick={g.clearLb}>
                Tozalash
              </button>
            </div>
            <LbList entries={g.leaderboardEntries} />
          </ClayCard>
        </motion.section>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-surface-muted px-2 py-2">
      <div className="text-[10px] uppercase tracking-wide text-muted">{label}</div>
      <div className="text-lg font-black text-text">{value}</div>
    </div>
  );
}

function LbList({
  entries,
}: {
  entries: { name: string; score: number; mode: string }[];
}) {
  const medals = ['🥇', '🥈', '🥉'];
  if (!entries.length) {
    return <p className="py-6 text-center text-xs text-muted">Hali natija yo‘q</p>;
  }
  return (
    <ul className="space-y-2">
      {entries.map((e, i) => (
        <li
          key={`${e.name}-${e.score}-${i}`}
          className={cn(
            'flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold',
            i < 3 ? 'bg-primary-soft text-primary' : 'bg-surface-muted text-text',
          )}
        >
          <span>{medals[i] ?? i + 1}</span>
          <span className="flex-1 px-2 text-left">{e.name}</span>
          <span className="text-muted">{e.mode}</span>
          <span className="pl-2 font-bold">{e.score}</span>
        </li>
      ))}
    </ul>
  );
}
