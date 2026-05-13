import { STORAGE_KEYS, loadJson, loadString, saveJson, saveString } from '@/shared/lib/persistence';
import {
  PROFILE_MOCK_BRAIN_LEADERBOARD,
  PROFILE_MOCK_DISPLAY_NAME,
  PROFILE_MOCK_SOLO_RESULTS,
} from '@/features/profile/profileMockData';

/**
 * Loyihada birinchi marta (yoki tarix tozalanganidan keyin) localStorage bo‘sh bo‘lsa,
 * profil uchun demo statistikani yozadi.
 */
export function ensureProfileMockSeed() {
  const solo = loadJson(STORAGE_KEYS.soloResults, []);
  const brain = loadJson(STORAGE_KEYS.brainLeaderboard, []);

  if (solo.length > 0 || brain.length > 0) return;

  saveJson(STORAGE_KEYS.soloResults, PROFILE_MOCK_SOLO_RESULTS);
  saveJson(STORAGE_KEYS.brainLeaderboard, PROFILE_MOCK_BRAIN_LEADERBOARD);

  const user = loadString(STORAGE_KEYS.currentUser);
  if (!user?.trim()) {
    saveString(STORAGE_KEYS.currentUser, PROFILE_MOCK_DISPLAY_NAME);
  }
}
