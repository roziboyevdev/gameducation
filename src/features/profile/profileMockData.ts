import type { SoloResultEntry } from '@/features/solo-math/soloLogic';
import type { BrainLbEntry } from '@/features/brain-memory/brainLogic';

/** Profil uchun demo foydalanuvchi — Brain shaxsiy rekord bilan mos keladi */
export const PROFILE_MOCK_DISPLAY_NAME = 'Jamshid Karimov';

/** Oxirgisi birinchi (useSoloGame bilan bir xil tartib) */
export const PROFILE_MOCK_SOLO_RESULTS: SoloResultEntry[] = [
  {
    name: PROFILE_MOCK_DISPLAY_NAME,
    score: 18,
    diff: 'O\'rta',
    date: '13.05.2026',
  },
  {
    name: PROFILE_MOCK_DISPLAY_NAME,
    score: 16,
    diff: 'Oson',
    date: '12.05.2026',
  },
  {
    name: PROFILE_MOCK_DISPLAY_NAME,
    score: 17,
    diff: 'O\'rta',
    date: '10.05.2026',
  },
  {
    name: PROFILE_MOCK_DISPLAY_NAME,
    score: 14,
    diff: 'Qiyin',
    date: '08.05.2026',
  },
];

/** useBrainGame leaderboard (TOP 10) — bali yuqoridan tartiblangan */
export const PROFILE_MOCK_BRAIN_LEADERBOARD: BrainLbEntry[] = [
  { name: 'Malika Rahimova', score: 186, mode: 'Qiyin' },
  { name: PROFILE_MOCK_DISPLAY_NAME, score: 152, mode: "O'rta" },
  { name: 'Shoxrux Yusupov', score: 128, mode: "O'rta" },
  { name: PROFILE_MOCK_DISPLAY_NAME, score: 94, mode: 'Oson' },
  { name: 'Rustam Toshmatov', score: 86, mode: 'Oson' },
  { name: 'Gulnora Sodiqova', score: 72, mode: 'Oson' },
];
