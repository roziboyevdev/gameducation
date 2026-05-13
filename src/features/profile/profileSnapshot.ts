import type { SoloResultEntry } from '@/features/solo-math/soloLogic';
import type { BrainLbEntry } from '@/features/brain-memory/brainLogic';
import { STORAGE_KEYS, loadJson } from '@/shared/lib/persistence';

export type ProfileSnapshot = {
  soloTotalAttempts: number;
  soloBestScore: number | null;
  soloLast: SoloResultEntry | null;
  brainEntriesCount: number;
  brainBestScore: number | null;
  brainPersonalBest: number | null;
};

export function buildProfileSnapshot(displayName: string | null): ProfileSnapshot {
  const solo = loadJson<SoloResultEntry[]>(STORAGE_KEYS.soloResults, []);
  const brain = loadJson<BrainLbEntry[]>(STORAGE_KEYS.brainLeaderboard, []);

  const soloBestScore = solo.length ? Math.max(...solo.map((s) => s.score)) : null;
  const soloLast = solo[0] ?? null;

  const dn = displayName?.trim().toLowerCase();
  let brainPersonalBest: number | null = null;
  if (dn && brain.length) {
    const scores = brain
      .filter((e) => e.name.trim().toLowerCase() === dn)
      .map((e) => e.score);
    brainPersonalBest = scores.length ? Math.max(...scores) : null;
  }

  const brainSorted = [...brain].sort((a, b) => b.score - a.score);
  const brainBestScore = brainSorted.length ? brainSorted[0]!.score : null;

  return {
    soloTotalAttempts: solo.length,
    soloBestScore,
    soloLast,
    brainEntriesCount: brain.length,
    brainBestScore,
    brainPersonalBest,
  };
}
