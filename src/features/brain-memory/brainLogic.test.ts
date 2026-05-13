import { describe, expect, it } from 'vitest';
import {
  BRAIN_MODES,
  brainPointsForAnswer,
  brainSessionGrade,
  generateBrainNumbers,
  sumNumbers,
} from '@/features/brain-memory/brainLogic';

describe('brainLogic', () => {
  it('sumNumbers', () => {
    expect(sumNumbers([1, 2, 3])).toBe(6);
  });

  it('generateBrainNumbers length', () => {
    expect(generateBrainNumbers(4, () => 0)).toHaveLength(4);
  });

  it('brainPointsForAnswer uses streak before increment', () => {
    expect(brainPointsForAnswer(0)).toBe(10);
    expect(brainPointsForAnswer(3)).toBe(16);
  });

  it('brainSessionGrade thresholds', () => {
    expect(brainSessionGrade(250).icon).toBe('🏆');
    expect(brainSessionGrade(50).grade).toContain('📈');
  });

  it('BRAIN_MODES keys', () => {
    expect(BRAIN_MODES.easy.numCount).toBe(3);
    expect(BRAIN_MODES.hard.numCount).toBe(5);
  });
});
