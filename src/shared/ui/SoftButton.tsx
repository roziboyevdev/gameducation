import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/shared/lib/cn';

type Variant = 'primary' | 'ghost' | 'white';

const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-white shadow-[var(--shadow-clay-sm)] hover:brightness-[1.03] active:scale-[0.97]',
  ghost:
    'bg-primary-soft text-primary hover:bg-[#e0dcff] active:scale-[0.97]',
  white:
    'bg-white text-text shadow-[var(--shadow-clay-sm)] ring-1 ring-black/[0.06] hover:bg-surface-muted active:scale-[0.97]',
};

export function SoftButton({
  className,
  variant = 'primary',
  ...props
}: ComponentPropsWithoutRef<'button'> & { variant?: Variant }) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex cursor-pointer items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold tracking-tight transition-transform transition-colors disabled:pointer-events-none disabled:opacity-40',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
