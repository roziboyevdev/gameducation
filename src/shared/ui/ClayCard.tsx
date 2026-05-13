import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/shared/lib/cn';

export function ClayCard({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-clay)] bg-surface shadow-[var(--shadow-clay)] ring-1 ring-black/[0.04]',
        className,
      )}
      {...props}
    />
  );
}
