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

function formatMinutes(total: number) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h}soat ${m}daq`;
}

const weekdays = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'];

const DATE_STRIP_RANGE = 21;

function formatLocalDayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function DashboardPage() {
  const { data, isPending } = useDashboardOverview();
  const todayChipRef = useRef<HTMLDivElement>(null);

  const dates = useMemo(() => {
    const base = new Date();
    base.setHours(12, 0, 0, 0);
    const out: { key: string; label: string; sub: string; active: boolean }[] = [];
    for (let i = -DATE_STRIP_RANGE; i <= DATE_STRIP_RANGE; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      out.push({
        key: formatLocalDayKey(d),
        label: weekdays[d.getDay()] ?? '',
        sub: String(d.getDate()),
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
  const lessonPct = data
    ? Math.min(100, Math.round((data.lessonMinutesTotal / (data.dailyGoalMinutes * 14)) * 100))
    : 0;

  return (
    <div className="flex flex-col gap-5">
      <section className="flex gap-3">
        <ClayCard className="flex flex-1 flex-row items-center justify-between gap-3 p-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted">Faollik</p>
            <p className="text-lg font-bold text-text">
              {isPending ? '…' : `${enrollmentPct}%`}
            </p>
            <p className="text-[11px] text-muted">o‘yinlar bo‘yicha</p>
          </div>
          <ProgressRing
            value={isPending ? 0 : enrollmentPct}
            caption={`${isPending ? '…' : enrollmentPct}%`}
            progressClass="text-accent-green"
          />
        </ClayCard>
        <ClayCard className="flex flex-1 flex-row items-center justify-between gap-3 p-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted">Vaqt</p>
            <p className="text-lg font-bold text-text">
              {isPending ? '…' : formatMinutes(data!.lessonMinutesTotal)}
            </p>
            <p className="text-[11px] text-muted">jami mashq</p>
          </div>
          <ProgressRing
            value={isPending ? 0 : lessonPct}
            caption={`${isPending ? '…' : lessonPct}%`}
            progressClass="text-accent-blue"
          />
        </ClayCard>
      </section>

      <section aria-label="Kunlar bo‘ylab scroll" className="overflow-visible">
        <div
          className={cn(
            '-mx-4 flex touch-pan-x gap-2.5 overflow-x-auto overscroll-x-contain px-4',
            /* Vertikal margins: scroll clippingdan soyalar uchun joy */
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
              className="flex shrink-0 snap-center snap-always items-stretch py-0.5"
            >
              <motion.div
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 520, damping: 30 }}
                className={cn(
                  'flex min-w-[56px] select-none flex-col items-center rounded-2xl border px-3.5 py-2.5 text-center',
                  'ring-1 ring-black/[0.04]',
                  /* Yengil soyalar — scroll zonasida kesilmasligi uchun katta blur emas */
                  'shadow-[0_1px_2px_rgb(17_24_39_/6%),0_3px_10px_-2px_rgb(17_24_39_/8%)]',
                  'transition-[background-color,border-color,box-shadow,color] duration-300 ease-out',
                  d.active
                    ? cn(
                        'border-primary bg-primary-soft text-muted ring-primary/25',
                        'shadow-[0_1px_2px_rgb(93_95_239_/22%),0_4px_14px_-3px_rgb(93_95_239_/28%)]',
                      )
                    : cn(
                        'border-transparent bg-white/90 text-muted hover:border-black/[0.07] hover:bg-white',
                        'hover:shadow-[0_2px_8px_-2px_rgb(17_24_39_/10%)]',
                      ),
                )}
              >
                <span className="text-[11px] font-semibold tracking-wide">{d.label}</span>
                <span className="text-[15px] font-extrabold tabular-nums text-text">{d.sub}</span>
              </motion.div>
            </div>
          ))}
        </div>
      </section>

      <ClayCard className="relative overflow-hidden p-5">
        <div className="relative z-10 flex flex-col gap-3">
          <div className="inline-flex w-fit rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold text-primary ring-1 ring-primary/15">
            Kun rejasi
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-text">
            Matematikani muntazam mashq qiling.
          </h2>
          <p className="text-sm leading-relaxed text-muted">
            Solo, Battle va Brain rejimlarida bilimingizni o‘lchang — hammasi bir joyda.
          </p>
          <motion.div whileTap={{ scale: 0.97 }} className="mt-1 w-full sm:w-auto">
            <Link
              to={ROUTES.solo}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold tracking-tight text-text shadow-[var(--shadow-clay-sm)] ring-1 ring-black/[0.06] transition-colors hover:bg-surface-muted sm:w-auto"
            >
              Solo bilan boshlash
            </Link>
          </motion.div>
        </div>
        <div className="relative mt-4 h-[180px] w-full overflow-hidden rounded-[var(--radius-clay-lg)] ring-1 ring-black/[0.04]">
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#e8eeff] to-[#f6e9ff] text-xs text-muted">
                3D yuklanmoqda…
              </div>
            }
          >
            <MascotScene className="h-full w-full" />
          </Suspense>
        </div>
      </ClayCard>

      <div>
        <p className="mb-3 px-1 text-sm font-bold text-text">Amaliyot orqali o‘rganing</p>
        <div className="grid grid-cols-2 gap-3">
          <GameTile
            to={ROUTES.solo}
            title="SOLO MATH"
            subtitle="Test va taymer"
            iconVariant="solo"
            className="bg-gradient-to-br from-accent-lavender to-white"
          />
          <GameTile
            to={ROUTES.battle}
            title="BATTLE"
            subtitle="2 o‘yinchi"
            iconVariant="battle"
            className="bg-gradient-to-br from-accent-peach to-white"
          />
          <GameTile
            to={ROUTES.brain}
            title="BRAIN"
            subtitle="Xotira mashqi"
            iconVariant="brain"
            className="bg-gradient-to-br from-[#daf8ef] to-white col-span-2"
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
            'flex flex-col gap-1 overflow-hidden p-4 ring-1 ring-white/50 backdrop-blur-[1px] transition-[box-shadow] duration-300 hover:shadow-[var(--shadow-clay)]',
            className,
          )}
        >
          <div className="-mx-1 -mt-1 mb-1 overflow-hidden rounded-xl bg-white/45 shadow-[inset_0_1px_0_rgb(255_255_255_/70%)] ring-1 ring-black/[0.05]">
            <Suspense
              fallback={
                <div className="h-[92px] w-full animate-pulse bg-gradient-to-br from-white/70 via-white/25 to-transparent" />
              }
            >
              <GameCard3DIcon variant={iconVariant} />
            </Suspense>
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">{subtitle}</span>
          <span className="text-base font-extrabold tracking-tight text-text">{title}</span>
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
