import { useEffect } from 'react';
import { ensureProfileMockSeed } from '@/features/profile/ensureProfileMockSeed';
import { STORAGE_KEYS, loadString } from '@/shared/lib/persistence';
import { useSessionStore } from '@/store/sessionStore';

export function useHydrateSession() {
  const setDisplayName = useSessionStore((s) => s.setDisplayName);

  useEffect(() => {
    ensureProfileMockSeed();
    const saved = loadString(STORAGE_KEYS.currentUser);
    if (saved) setDisplayName(saved);
  }, [setDisplayName]);
}
