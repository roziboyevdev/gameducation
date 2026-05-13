import { describe, expect, it } from 'vitest';
import { generateBattleQuestion, type BattleOp } from '@/features/battle/battleLogic';

describe('battleLogic', () => {
  it('respects active ops plus', () => {
    let i = 0;
    const rng = () => [0.99, 0.01][i++] ?? 0.5;
    const q = generateBattleQuestion(['+'], rng);
    expect(q.qOp).toBe('+');
    expect(q.qAns).toBe(q.qa + q.qb);
  });

  it('multiply branch', () => {
    const q = generateBattleQuestion(['×'], () => 0);
    expect(q.qOp).toBe('×');
    expect(q.qAns).toBe(q.qa * q.qb);
  });

  it('subtract uses qa >= qb', () => {
    const ops: BattleOp[] = ['−'];
    for (let k = 0; k < 20; k++) {
      const q = generateBattleQuestion(ops, Math.random);
      expect(q.qOp).toBe('−');
      expect(q.qAns).toBe(q.qa - q.qb);
      expect(q.qb).toBeLessThanOrEqual(q.qa);
    }
  });
});
