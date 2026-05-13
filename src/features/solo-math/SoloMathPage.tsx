import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ClayCard } from '@/shared/ui/ClayCard';
import { SoftButton } from '@/shared/ui/SoftButton';
import { launchConfettiCanvas } from '@/shared/lib/confetti';
import { cn } from '@/shared/lib/cn';
import { useSoloGame } from '@/features/solo-math/useSoloGame';

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

          <ClayCard className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-text">Oxirgi natijalar</span>
              <button type="button" className="text-xs font-semibold text-primary" onClick={g.clearResults}>
                Tozalash
              </button>
            </div>
            {g.history.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted">Hali natija yo‘q</p>
            ) : (
              <ul className="space-y-2">
                {g.history.map((r, i) => (
                  <li
                    key={`${r.name}-${r.date}-${i}`}
                    className="flex items-center justify-between rounded-xl bg-surface-muted px-3 py-2 text-xs"
                  >
                    <span className="font-semibold text-text">{r.name}</span>
                    <span className="text-muted">{r.diff}</span>
                    <span className="font-bold text-primary">
                      {r.score}/{g.soloTotal}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </ClayCard>
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

          <ClayCard className="p-4">
            <p className="mb-2 text-center text-xs font-bold text-muted">Tarix</p>
            {g.history.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted">Bo‘sh</p>
            ) : (
              <ul className="space-y-2">
                {g.history.map((r, i) => (
                  <li
                    key={`${r.name}-${r.date}-${i}-res`}
                    className="flex justify-between rounded-xl bg-surface-muted px-3 py-2 text-xs"
                  >
                    <span className="font-semibold">{r.name}</span>
                    <span className="font-bold text-primary">
                      {r.score}/{g.soloTotal}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </ClayCard>
        </motion.section>
      ) : null}
    </div>
  );
}
