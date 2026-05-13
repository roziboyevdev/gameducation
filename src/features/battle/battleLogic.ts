export type BattleOp = '+' | '−' | '×';

export function generateBattleQuestion(
  activeOps: BattleOp[],
  random: () => number = Math.random,
): { qa: number; qb: number; qOp: BattleOp; qAns: number } {
  const ops = activeOps.length ? activeOps : (['+'] as BattleOp[]);
  const qOp = ops[Math.floor(random() * ops.length)]!;
  let qa: number;
  let qb: number;
  let qAns: number;

  if (qOp === '×') {
    qa = Math.floor(random() * 13);
    qb = Math.floor(random() * 13);
    qAns = qa * qb;
  } else if (qOp === '+') {
    qa = Math.floor(random() * 21);
    qb = Math.floor(random() * 21);
    qAns = qa + qb;
  } else {
    qa = Math.floor(random() * 30);
    qb = Math.floor(random() * (qa + 1));
    qAns = qa - qb;
  }

  return { qa, qb, qOp, qAns };
}
