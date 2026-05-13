export const STORAGE_KEYS = {
  currentUser: 'currentUser',
  soloResults: 'results',
  brainLeaderboard: 'brain-lb',
} as const;

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

export function loadJson<T>(key: string, fallback: T): T {
  const s = getStorage();
  if (!s) return fallback;
  try {
    const raw = s.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJson(key: string, value: unknown) {
  const s = getStorage();
  if (!s) return;
  s.setItem(key, JSON.stringify(value));
}

export function removeKey(key: string) {
  getStorage()?.removeItem(key);
}

export function loadString(key: string): string | null {
  return getStorage()?.getItem(key) ?? null;
}

export function saveString(key: string, value: string) {
  getStorage()?.setItem(key, value);
}
