import { lazy, Suspense, useLayoutEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/shared/config/routes';
import { useDashboardOverview } from '@/shared/api/dashboardOverview';
import { ClayCard } from '@/shared/ui/ClayCard';
import { ProgressRing } from '@/shared/ui/ProgressRing';
import { cn } from '@/shared/lib/cn';

const MascotScene = lazy(() =>
  import('@/shared/ui/MascotScene').then((m) => ({ default: m.MascotScene })),
);

const GameCard3DIcon = lazy(() =>
  import('@/features/dashboard/GameCard3DIcon').then((m) => ({ default: m.GameCard3DIcon })),
);

const KPI_LOCALE = 'en-US';

const DATE_STRIP_RANGE = 21;

function formatLocalDayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatLessonHm(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h}h ${String(m).padStart(2, '0')}m`;
}

function TripodMark({ active }: { active: boolean }) {
  return (
    <svg
      width={20}
      height={14}
      viewBox="0 0 20 14"
      className={cn(
        'mt-1 shrink-0',
        active ? 'text-[var(--color-accent-blue)]' : 'text-slate-200',
      )}
      aria-hidden
    >
      <path
        d="M10 2 4.5 12.5 M10 2l5.5 10.5 M5 12.5h10"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.95}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DashboardHeroBackdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[calc(var(--radius-clay-lg)-2px)]"
      aria-hidden
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#eef5ff] via-white to-[#fcfdff]" />
      <div className="absolute inset-x-0 top-0 h-[46%] bg-[radial-gradient(ellipse_95%_100%_at_50%_0%,rgb(219_234_254/0.55),transparent_58%)]" />
    </div>
  );
}

function StatIconPlay() {
  return (
    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#d1fae5] via-[#a7f3d0] to-[#6ee7b7] shadow-[inset_0_1px_0_rgb(255_255_255_/70%),0_6px_14px_rgb(16_185_129_/18%)] ring-1 ring-white/80">
      <div className="absolute -right-1 -top-1 h-7 w-7 rounded-full bg-white/45 blur-md" />
      <svg width="18" height="18" viewBox="0 0 24 24" className="relative ml-0.5 text-emerald-800/90" aria-hidden>
        <path d="M9 7.5v9l7.5-4.5L9 7.5z" fill="currentColor" />
      </svg>
    </div>
  );
}

function StatIconShield() {
  return (
    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#e0e7ff] via-[#c7d2fe] to-[#a5b4fc] shadow-[inset_0_1px_0_rgb(255_255_255_/75%),0_6px_14px_rgb(99_102_241_/22%)] ring-1 ring-white/80">
      <div className="absolute -left-1 bottom-0 h-8 w-8 rounded-full bg-white/50 blur-md" />
      <svg width="17" height="17" viewBox="0 0 24 24" className="relative text-indigo-700/90" aria-hidden>
        <path
          d="M12 3.2 5.4 5.4v5.6c0 4.1 2.9 7.9 6.6 8.8 3.7-.9 6.6-4.7 6.6-8.8V5.4L12 3.2z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M9.2 12.2l1.7 1.7 4.1-4.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function DashboardPage() {
  const { data, isPending } = useDashboardOverview();
  const todayChipRef = useRef<HTMLDivElement>(null);

  const dates = useMemo(() => {
    const base = new Date();
    base.setHours(12, 0, 0, 0);
    const out: {
      key: string;
      weekdayShort: string;
      dayNum: string;
      active: boolean;
    }[] = [];
    for (let i = -DATE_STRIP_RANGE; i <= DATE_STRIP_RANGE; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      out.push({
        key: formatLocalDayKey(d),
        weekdayShort:
          d
            .toLocaleDateString(KPI_LOCALE, { weekday: 'short' })
            .replace(/\.$/, '') ?? '',
        dayNum: String(d.getDate()),
        active: i === 0,
      });
    }
    return out;
  }, []);

  useLayoutEffect(() => {
    const el = todayChipRef.current;
    if (!el || typeof window === 'undefined') return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scrollToday = () => {
      el.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    };

    if (reduceMotion) {
      scrollToday();
      return;
    }

    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(scrollToday);
    });
    return () => window.cancelAnimationFrame(id);
  }, [dates]);

  const enrollmentPct = data?.enrollmentPct ?? 0;
  const enrollmentVideos = data?.enrollmentVideos ?? 0;
  const lessonPct = data
    ? Math.min(100, Math.round((data.lessonMinutesTotal / (data.dailyGoalMinutes * 14)) * 100))
    : 0;
  const lessonHm = data ? formatLessonHm(data.lessonMinutesTotal) : '…';

  return (
    <div className="flex flex-col gap-5">
      <section className="grid grid-cols-2 gap-3">
        <motion.div whileTap={{ scale: 0.985 }} className="min-h-0 min-w-0">
          <ClayCard className="relative h-full overflow-hidden p-4">
            <div className="pointer-events-none absolute -right-[18%] -top-[40%] h-[130%] w-[70%] rounded-full bg-gradient-to-bl from-emerald-200/55 via-transparent to-transparent blur-2xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-6 h-24 w-24 rounded-full bg-teal-200/35 blur-xl" />
            <div className="relative grid min-h-[4.75rem] grid-cols-[2.75rem_minmax(0,1fr)_3.375rem] items-center gap-x-2.5 gap-y-0">
              <StatIconPlay />
              <div className="min-w-0 overflow-hidden py-0.5">
                <p className="text-[10px] font-semibold uppercase leading-snug tracking-wider text-muted">
                  Enrollment
                </p>
                <p className="truncate text-base font-extrabold leading-tight tracking-tight text-text sm:text-[17px]">
                  {isPending ? '…' : `${enrollmentVideos} Video`}
                </p>
              </div>
              <div className="flex justify-end">
                <ProgressRing
                  value={isPending ? 0 : enrollmentPct}
                  size={54}
                  stroke={6}
                  trackClass="text-black/[0.06]"
                  progressClass="text-[var(--color-accent-green)]"
                />
              </div>
            </div>
          </ClayCard>
        </motion.div>
        <motion.div whileTap={{ scale: 0.985 }} className="min-h-0 min-w-0">
          <ClayCard className="relative h-full overflow-hidden p-4">
            <div className="pointer-events-none absolute -left-[26%] -top-[52%] h-[148%] w-[78%] rounded-full bg-gradient-to-br from-[#dbeafe]/80 via-transparent to-transparent blur-[38px]" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-20 w-20 rounded-full bg-indigo-200/35 blur-xl" />
            <div className="relative grid min-h-[4.75rem] grid-cols-[2.75rem_minmax(0,1fr)_3.375rem] items-center gap-x-2.5 gap-y-0">
              <StatIconShield />
              <div className="min-w-0 overflow-hidden py-0.5">
                <p className="text-[10px] font-semibold uppercase leading-snug tracking-wider text-muted">
                  Lesson Done
                </p>
                <p className="whitespace-nowrap text-base font-extrabold leading-tight tracking-tight text-text tabular-nums sm:text-[17px]">
                  {isPending ? '…' : lessonHm}
                </p>
              </div>
              <div className="flex justify-end">
                <ProgressRing
                  value={isPending ? 0 : lessonPct}
                  size={54}
                  stroke={6}
                  trackClass="text-black/[0.06]"
                  progressClass="text-[var(--color-accent-blue)]"
                />
              </div>
            </div>
          </ClayCard>
        </motion.div>
      </section>

      <section aria-label="Kunlar bo‘ylab scroll" className="overflow-visible">
        <div
          className={cn(
            '-mx-4 flex touch-pan-x gap-3 overflow-x-auto overscroll-x-contain px-4',
            'py-5',
            'scroll-smooth [-webkit-overflow-scrolling:touch]',
            'snap-x snap-proximity',
            'motion-reduce:snap-none motion-reduce:scroll-auto',
            'scrollbar-hide',
          )}
        >
          {dates.map((d) => (
            <div
              key={d.key}
              ref={d.active ? todayChipRef : undefined}
              className="flex shrink-0 snap-center snap-always items-stretch px-1 py-0.5"
            >
              <motion.div
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 520, damping: 30 }}
                className={cn(
                  'flex min-w-[3.125rem] select-none flex-col items-center rounded-[1.65rem] border px-[0.7rem] py-2 text-center',
                  'transition-[background-color,border-color,box-shadow,color,filter] duration-300 ease-out',
                  d.active
                    ? cn(
                        'relative border-[rgb(125_211_252/0.72)] bg-white',
                        'shadow-[0_1px_2px_rgb(14_165_233_/14%),0_10px_28px_-12px_rgb(56_189_248_/32%)]',
                      )
                    : cn(
                        'border-transparent bg-transparent text-muted hover:bg-white/60',
                      ),
                )}
              >
                <span
                  className={cn(
                    'text-[11px] font-bold tracking-wide',
                    d.active ? 'text-slate-600' : 'text-muted',
                  )}
                >
                  {d.weekdayShort}
                </span>
                <span
                  className={cn(
                    'mt-0.5 text-[15px] font-extrabold tabular-nums',
                    d.active ? 'text-[#111827]' : 'text-text/65',
                  )}
                >
                  {d.dayNum}
                </span>
                <TripodMark active={d.active} />
              </motion.div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[var(--radius-clay-lg)] bg-white shadow-[var(--shadow-clay)] ring-1 ring-sky-100/75">
        <DashboardHeroBackdrop />

        <div className="relative z-[2] flex flex-col items-center px-5 pb-8 pt-5">
          <div className="relative mx-auto mb-8 h-[min(54vw,13.75rem)] min-h-[11rem] w-full max-w-[300px]">
            <div className="relative h-full w-full overflow-hidden rounded-[1.25rem] bg-white shadow-[0_10px_40px_-24px_rgb(15_23_42_/0.22),0_0_0_1px_rgb(224_242_254/0.95),inset_0_1px_0_rgb(255_255_255)]">
              <div
                className="pointer-events-none absolute inset-x-[6%] bottom-[3%] z-0 h-[26%] rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgb(202_206_218/0.42),transparent_68%)] blur-[18px]"
                aria-hidden
              />
              <Suspense
                fallback={
                  <div className="flex h-full items-center justify-center bg-white text-xs font-medium text-muted">
                    3D…
                  </div>
                }
              >
                <MascotScene className="relative z-[1] h-full w-full rounded-[1.2rem]" studioStage />
              </Suspense>
            </div>
          </div>
          <h2 className="mx-auto mb-7 max-w-[18rem] text-center text-[1.15rem] font-extrabold leading-snug tracking-tight text-[#1e293b] sm:text-xl">
            Muntazam o‘quv tartibini yarating
          </h2>
          <motion.div whileTap={{ scale: 0.98 }} className="w-full max-w-[20rem]">
            <Link
              to={ROUTES.profile}
              className="flex w-full items-center justify-center rounded-full bg-white px-6 py-[0.95rem] text-[15px] font-semibold text-[#334155] shadow-[0_4px_18px_-4px_rgb(15_23_42_/14%),inset_0_1px_0_rgb(255_255_255_/95%)] ring-1 ring-black/[0.07] transition hover:bg-white"
            >
              Ro‘yxatdan o‘tish
            </Link>
          </motion.div>
        </div>
      </section>

      <div>
        <p className="mb-3 px-1 text-sm font-bold text-text">Amaliyot orqali o‘rganing</p>
        <div className="grid grid-cols-2 gap-3">
          <GameTile
            to={ROUTES.solo}
            title="SOLO MATH"
            subtitle="Test va taymer"
            iconVariant="solo"
            className="bg-gradient-to-br from-accent-lavender via-white to-white"
          />
          <GameTile
            to={ROUTES.battle}
            title="BATTLE"
            subtitle="2 o‘yinchi"
            iconVariant="battle"
            className="bg-gradient-to-br from-accent-peach via-white to-white"
          />
          <GameTile
            to={ROUTES.brain}
            title="BRAIN"
            subtitle="Xotira mashqi"
            iconVariant="brain"
            className="bg-gradient-to-br from-[#d6f8ed] via-white to-white col-span-2"
          />
        </div>
      </div>

      <DevHealthBadge />
    </div>
  );
}

function GameTile({
  to,
  title,
  subtitle,
  iconVariant,
  className,
}: {
  to: string;
  title: string;
  subtitle: string;
  iconVariant: 'solo' | 'battle' | 'brain';
  className?: string;
}) {
  return (
    <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
      <Link
        to={to}
        className="block rounded-[var(--radius-clay)] outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
      >
        <ClayCard
          className={cn(
            'relative flex flex-col gap-2 overflow-hidden p-4 pt-4 ring-1 ring-white/60 backdrop-blur-[2px]',
            'shadow-[var(--shadow-clay-sm)] transition-[box-shadow,transform] duration-300 hover:shadow-[var(--shadow-clay)]',
            'before:pointer-events-none before:absolute before:inset-0 before:rounded-[var(--radius-clay)] before:bg-gradient-to-br before:from-white/55 before:to-transparent before:opacity-90',
            className,
          )}
        >
          <div className="relative z-[1] -mx-0.5 -mt-1 mb-0.5 overflow-hidden rounded-2xl bg-white/[0.72] shadow-[inset_0_1px_0_rgb(255_255_255_/80%)] ring-1 ring-black/[0.05]">
            <Suspense
              fallback={
                <div className="h-[92px] w-full animate-pulse bg-gradient-to-br from-white/85 via-white/35 to-transparent" />
              }
            >
              <GameCard3DIcon variant={iconVariant} />
            </Suspense>
          </div>
          <span className="relative z-[1] text-[11px] font-semibold uppercase tracking-wide text-muted">
            {subtitle}
          </span>
          <span className="relative z-[1] text-base font-extrabold tracking-tight text-text">{title}</span>
        </ClayCard>
      </Link>
    </motion.div>
  );
}

/** TanStack Query kanalini tekshirish uchun yengil indikator */
function DevHealthBadge() {
  const q = useQuery({
    queryKey: ['health'],
    queryFn: async () => ({ ok: true as const }),
    staleTime: Infinity,
  });
  return (
    <p className="px-1 text-center text-[10px] font-medium text-muted/80">
      Ma’lumot katmani: {q.isSuccess ? 'tayyor' : '…'}
    </p>
  );
}
