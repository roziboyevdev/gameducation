export type BrainMode = 'easy' | 'medium' | 'hard';

export const BRAIN_MODES: Record<
  BrainMode,
  { label: string; showTimeMs: number; numCount: number }
> = {
  easy: { label: 'Oson', showTimeMs: 2000, numCount: 3 },
  medium: { label: "O'rta", showTimeMs: 1500, numCount: 4 },
  hard: { label: 'Qiyin', showTimeMs: 900, numCount: 5 },
};

export function generateBrainNumbers(
  count: number,
  random: () => number = Math.random,
): number[] {
  const nums: number[] = [];
  for (let i = 0; i < count; i++) nums.push(Math.floor(random() * 10));
  return nums;
}

export function sumNumbers(nums: number[]) {
  return nums.reduce((a, b) => a + b, 0);
}

/** Ball: 10 + (ketma-ket to'g'ri javoblardan oldingi streak) * 2 */
export function brainPointsForAnswer(streakBeforeCorrect: number) {
  return 10 + streakBeforeCorrect * 2;
}

export type BrainLbEntry = { name: string; score: number; mode: string };

export function brainSessionGrade(score: number) {
  const grade =
    score >= 200
      ? '🧠 Dahosiz miya!'
      : score >= 100
        ? '⭐ Ajoyib natija!'
        : score >= 50
          ? "📈 Yaxshi harakat!"
          : "💪 Ko'proq mashq kerak";
  const icon = score >= 200 ? '🏆' : score >= 100 ? '⭐' : score >= 50 ? '📊' : '💪';
  return { grade, icon };
}
