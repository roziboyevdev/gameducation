import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ClayCard } from '@/shared/ui/ClayCard';
import { SoftButton } from '@/shared/ui/SoftButton';
import { cn } from '@/shared/lib/cn';
import { launchConfettiCanvas } from '@/shared/lib/confetti';
import type { BattleOp } from '@/features/battle/battleLogic';
import { useBattleGame } from '@/features/battle/useBattleGame';

export function BattlePage() {
  const b = useBattleGame();
  const confettiRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (b.phase !== 'win') return;
    const canvas = confettiRef.current;
    if (!canvas) return;
    const base = b.winnerSlot === 1 ? '#f59e0b' : '#22d3ee';
    const colors = [base, '#ffffff', '#5d5fef', `${base}99`, '#f43f5e'];
    return launchConfettiCanvas(canvas, colors);
  }, [b.phase, b.winnerSlot]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return;
      if (b.phase === 'game') b.checkAnswer();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [b]);

  const targets = [5, 10, 15];

  return (
    <div className="relative pb-4">
      <canvas ref={confettiRef} className="pointer-events-none fixed inset-0 z-[60]" />

      {b.phase === 'setup' ? (
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <ClayCard className="space-y-4 p-5">
            <h1 className="text-xl font-extrabold text-text">BATTLE</h1>
            <p className="text-sm text-muted">Ikki o‘yinchi — kim birinchi finishga yetadi?</p>

            <Field
              label="1-o‘yinchi"
              value={b.p1Name}
              onChange={b.setP1Name}
              error={b.err1}
            />
            <Field
              label="2-o‘yinchi"
              value={b.p2Name}
              onChange={b.setP2Name}
              error={b.err2}
            />

            <div>
              <p className="mb-2 text-xs font-semibold text-muted">Amallar</p>
              <div className="flex flex-wrap gap-2">
                {(['+', '−', '×'] as BattleOp[]).map((op) => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => b.toggleOp(op)}
                    className={cn(
                      'rounded-full px-4 py-2 text-sm font-bold transition-colors',
                      b.activeOps.includes(op)
                        ? 'bg-primary text-white shadow-[var(--shadow-clay-sm)]'
                        : 'bg-surface-muted text-muted',
                    )}
                  >
                    {op}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold text-muted">Masofa</p>
              <div className="flex flex-wrap gap-2">
                {targets.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => b.setTargetPos(t)}
                    className={cn(
                      'rounded-full px-4 py-2 text-xs font-bold',
                      b.targetPos === t
                        ? 'bg-primary-soft text-primary ring-2 ring-primary'
                        : 'bg-white text-muted ring-1 ring-black/[0.06]',
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <SoftButton className="w-full" onClick={b.startGame}>
              Jangni boshlash
            </SoftButton>
          </ClayCard>
        </motion.section>
      ) : null}

      {b.phase === 'game' ? (
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <ClayCard className="space-y-4 p-4">
            <div
              className={cn(
                'rounded-2xl px-4 py-3 text-center text-sm font-bold text-white shadow-inner',
                b.currentTurn === 1 ? 'bg-gradient-to-r from-amber-400 to-orange-400' : 'bg-gradient-to-r from-sky-400 to-cyan-400',
              )}
            >
              Navbat: {b.currentTurn === 1 ? b.p1 : b.p2}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
              <div className="rounded-2xl bg-surface-muted px-3 py-2">
                <span className="text-muted">{truncate(b.p1, 8)}</span>
                <span className="float-right font-bold text-primary">{b.pos1}/{b.targetPos}</span>
              </div>
              <div className="rounded-2xl bg-surface-muted px-3 py-2">
                <span className="text-muted">{truncate(b.p2, 8)}</span>
                <span className="float-right font-bold text-primary">{b.pos2}/{b.targetPos}</span>
              </div>
            </div>

            <Track filled={b.pos1} total={b.targetPos} tone="amber" />
            <Track filled={b.pos2} total={b.targetPos} tone="cyan" />

            <div
              className={cn(
                'rounded-[var(--radius-clay)] p-4 text-center text-xl font-black tracking-tight text-white shadow-[var(--shadow-clay-sm)]',
                b.currentTurn === 1 ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-sky-400 to-cyan-500',
              )}
            >
              {b.qa} {b.qOp} {b.qb} = ?
            </div>

            <input
              value={b.answerInput}
              onChange={(e) => b.setAnswerInput(e.target.value)}
              className={cn(
                'w-full rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-lg font-bold outline-none ring-primary/30 focus:ring-4',
                b.inputCls === 'correct' && 'border-emerald-400',
                b.inputCls === 'wrong' && 'border-rose-400',
              )}
              inputMode="numeric"
              autoFocus
            />

            {b.feed ? (
              <p
                className={cn(
                  'text-center text-sm font-bold',
                  b.feed.ok ? 'text-emerald-600' : 'text-rose-600',
                )}
              >
                {b.feed.msg}
              </p>
            ) : null}

            <SoftButton className="w-full" onClick={b.checkAnswer}>
              Tekshirish
            </SoftButton>
          </ClayCard>

          <ClayCard className="p-4">
            <p className="mb-2 text-xs font-bold text-muted">Turnir</p>
            <ul className="space-y-2">
              {b.leaderboard.map(([name, w]) => (
                <li key={name} className="flex justify-between rounded-xl bg-surface-muted px-3 py-2 text-xs font-semibold">
                  <span>{name}</span>
                  <span className="text-primary">{w} yutish</span>
                </li>
              ))}
            </ul>
          </ClayCard>
        </motion.section>
      ) : null}

      {b.phase === 'win' ? (
        <motion.section initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <ClayCard className="space-y-4 p-6 text-center">
            <h2
              className={cn(
                'text-2xl font-black',
                b.winnerSlot === 1 ? 'text-amber-500' : 'text-cyan-500',
              )}
            >
              {b.winnerName}
            </h2>
            <p className="text-sm text-muted">Barcha {b.targetPos} bosqichni zabt etdi!</p>
            <div className="flex flex-col gap-2">
              <SoftButton onClick={b.rematch}>Revansh</SoftButton>
              <SoftButton variant="ghost" onClick={b.backSetup}>
                Sozlamalar
              </SoftButton>
            </div>
          </ClayCard>
        </motion.section>
      ) : null}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error: string | null;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-muted">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-sm font-medium outline-none focus:ring-4 focus:ring-primary/25',
          error && 'border-rose-400',
        )}
      />
      {error ? <p className="text-xs font-semibold text-rose-500">⚠ {error}</p> : null}
    </div>
  );
}

function Track({
  filled,
  total,
  tone,
}: {
  filled: number;
  total: number;
  tone: 'amber' | 'cyan';
}) {
  const fill =
    tone === 'amber'
      ? 'bg-gradient-to-r from-amber-400 to-orange-400'
      : 'bg-gradient-to-r from-sky-400 to-cyan-400';

  return (
    <div className="flex gap-1 rounded-2xl bg-black/[0.04] p-1">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={`cell-${tone}-${i}`}
          className={cn(
            'h-3 flex-1 rounded-full transition-colors',
            i < filled ? fill : 'bg-transparent',
          )}
        />
      ))}
    </div>
  );
}

function truncate(s: string, max: number) {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}
