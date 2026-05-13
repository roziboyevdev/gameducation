import { describe, expect, it } from 'vitest';
import {
  SOLO_TOTAL,
  generateSoloQuestion,
  generateSoloQuestions,
  soloDifficultyLabel,
  soloGrade,
  soloMaxTimeSeconds,
} from '@/features/solo-math/soloLogic';

describe('soloLogic', () => {
  it('soloMaxTimeSeconds matches difficulty', () => {
    expect(soloMaxTimeSeconds('easy')).toBe(15);
    expect(soloMaxTimeSeconds('medium')).toBe(12);
    expect(soloMaxTimeSeconds('hard')).toBe(10);
  });

  it('generateSoloQuestion easy uses rng', () => {
    let i = 0;
    const seq = [0.05, 0.07];
    const rng = () => seq[i++] ?? 0;
    const q = generateSoloQuestion('easy', rng);
    expect(q.q).toMatch(/^\d+ \+ \d+$/);
    expect(typeof q.a).toBe('number');
  });

  it('generateSoloQuestions returns fixed length', () => {
    const qs = generateSoloQuestions('easy', SOLO_TOTAL, () => 0.5);
    expect(qs).toHaveLength(SOLO_TOTAL);
  });

  it('soloGrade tiers', () => {
    expect(soloGrade(18, SOLO_TOTAL).pct).toBeGreaterThanOrEqual(0.9);
    expect(soloGrade(10, SOLO_TOTAL).pct).toBe(0.5);
  });

  it('soloDifficultyLabel', () => {
    expect(soloDifficultyLabel('easy')).toBe('Oson');
  });
});
