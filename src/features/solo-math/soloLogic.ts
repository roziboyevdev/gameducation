export const SOLO_TOTAL = 20;

export type SoloDifficulty = 'easy' | 'medium' | 'hard';

export type SoloQuestion = { q: string; a: number };

const diffLabel: Record<SoloDifficulty, string> = {
  easy: 'Oson',
  medium: "O'rta",
  hard: 'Qiyin',
};

export function soloDifficultyLabel(d: SoloDifficulty) {
  return diffLabel[d];
}

/** Deterministic-friendly: pass rng in [0,1) for tests */
export function generateSoloQuestion(
  difficulty: SoloDifficulty,
  random: () => number = Math.random,
): SoloQuestion {
  let a: number;
  let b: number;
  let op: string;
  let ans: number;

  if (difficulty === 'easy') {
    a = Math.floor(random() * 11);
    b = Math.floor(random() * 11);
    op = '+';
    ans = a + b;
  } else if (difficulty === 'medium') {
    a = Math.floor(random() * 21);
    b = Math.floor(random() * 21);
    op = random() > 0.5 ? '+' : '−';
    ans = op === '+' ? a + b : a - b;
  } else {
    const ops = ['+', '−', '×'] as const;
    op = ops[Math.floor(random() * 3)]!;
    if (op === '×') {
      a = Math.floor(random() * 13);
      b = Math.floor(random() * 13);
      ans = a * b;
    } else {
      a = Math.floor(random() * 51);
      b = Math.floor(random() * 51);
      ans = op === '+' ? a + b : a - b;
    }
  }

  return { q: `${a} ${op} ${b}`, a: ans };
}

export function generateSoloQuestions(
  difficulty: SoloDifficulty,
  total = SOLO_TOTAL,
  random: () => number = Math.random,
): SoloQuestion[] {
  return Array.from({ length: total }, () => generateSoloQuestion(difficulty, random));
}

export function soloMaxTimeSeconds(difficulty: SoloDifficulty): number {
  if (difficulty === 'hard') return 10;
  if (difficulty === 'medium') return 12;
  return 15;
}

export type SoloResultEntry = { name: string; score: number; diff: string; date: string };

export function soloGrade(score: number, total: number) {
  const pct = score / total;
  const icon = pct >= 0.9 ? '🏆' : pct >= 0.7 ? '⭐' : pct >= 0.5 ? '📊' : '💪';
  const grade =
    pct >= 0.9
      ? 'Ajoyib! Siz matematik dahosiz!'
      : pct >= 0.7
        ? 'Yaxshi natija! Davom eting!'
        : pct >= 0.5
          ? "O'rta daraja. Ko'proq mashq qiling."
          : "Ko'proq o'rganish kerak. Harakat qiling!";
  return { icon, grade, pct };
}
