import { useCallback, useEffect, useRef, useState } from 'react';
import {
  SOLO_TOTAL,
  generateSoloQuestions,
  soloDifficultyLabel,
  soloGrade,
  soloMaxTimeSeconds,
  type SoloDifficulty,
  type SoloQuestion,
  type SoloResultEntry,
} from '@/features/solo-math/soloLogic';
import { STORAGE_KEYS, loadJson, saveJson, saveString } from '@/shared/lib/persistence';
import { validatePlayerName } from '@/shared/lib/validators';
import { useSessionStore } from '@/store/sessionStore';

export type SoloPhase = 'menu' | 'game' | 'result';

export function useSoloGame() {
  const setGlobalName = useSessionStore((s) => s.setDisplayName);

  const [phase, setPhase] = useState<SoloPhase>('menu');
  const [difficulty, setDifficulty] = useState<SoloDifficulty>('easy');
  const [playerName, setPlayerName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);

  const [questions, setQuestions] = useState<SoloQuestion[]>([]);
  const questionsRef = useRef<SoloQuestion[]>([]);
  questionsRef.current = questions;

  const [current, setCurrent] = useState(0);
  const currentRef = useRef(0);
  currentRef.current = current;

  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);

  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [answerInput, setAnswerInput] = useState('');
  const [inputStatus, setInputStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const [history, setHistory] = useState<SoloResultEntry[]>(() =>
    loadJson<SoloResultEntry[]>(STORAGE_KEYS.soloResults, []),
  );

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionEndedRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => () => clearTimer(), [clearTimer]);

  useEffect(() => {
    if (phase !== 'game') return;
    if (current < SOLO_TOTAL) return;
    if (sessionEndedRef.current) return;
    sessionEndedRef.current = true;

    clearTimer();

    const entry: SoloResultEntry = {
      name: playerName.trim(),
      score,
      diff: soloDifficultyLabel(difficulty),
      date: new Date().toLocaleDateString('uz-UZ'),
    };
    const stored = loadJson<SoloResultEntry[]>(STORAGE_KEYS.soloResults, []);
    const next = [entry, ...stored].slice(0, 10);
    saveJson(STORAGE_KEYS.soloResults, next);
    setHistory(next);
    setPhase('result');
  }, [phase, current, playerName, score, difficulty, clearTimer]);

  useEffect(() => {
    if (phase !== 'game') return;
    if (current >= SOLO_TOTAL) return;

    clearTimer();
    const max = soloMaxTimeSeconds(difficulty);
    setTimeLeft(max);
    setFeedback(null);
    setAnswerInput('');
    setInputStatus('idle');

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          const idx = currentRef.current;
          const ans = questionsRef.current[idx]?.a ?? 0;
          setWrongCount((w) => w + 1);
          setFeedback({ ok: false, msg: `Vaqt tugadi! Javob: ${ans}` });
          window.setTimeout(() => setCurrent((c) => c + 1), 1200);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [phase, current, difficulty, clearTimer]);

  const startTest = useCallback(() => {
    const err = validatePlayerName(playerName);
    if (err) {
      setNameError(err);
      return;
    }
    setNameError(null);
    const trimmed = playerName.trim();
    saveString(STORAGE_KEYS.currentUser, trimmed);
    setGlobalName(trimmed);

    sessionEndedRef.current = false;

    const qs = generateSoloQuestions(difficulty);
    setQuestions(qs);
    questionsRef.current = qs;
    setScore(0);
    setWrongCount(0);
    setCurrent(0);
    setPhase('game');
  }, [difficulty, playerName, setGlobalName]);

  const submitAnswer = useCallback(() => {
    clearTimer();
    if (answerInput.trim() === '') return;
    const val = Number.parseInt(answerInput, 10);
    if (Number.isNaN(val)) return;

    const idx = currentRef.current;
    const q = questionsRef.current[idx];
    if (!q) return;

    const correct = val === q.a;
    if (correct) {
      setScore((s) => s + 1);
      setInputStatus('correct');
      setFeedback({ ok: true, msg: "✓ To'g'ri!" });
    } else {
      setWrongCount((w) => w + 1);
      setInputStatus('wrong');
      setFeedback({ ok: false, msg: `✗ Xato! Javob: ${q.a}` });
    }
    window.setTimeout(() => setCurrent((c) => c + 1), 800);
  }, [answerInput, clearTimer]);

  const restartFromMenu = useCallback(() => {
    setPhase('menu');
    sessionEndedRef.current = false;
    clearTimer();
    setHistory(loadJson<SoloResultEntry[]>(STORAGE_KEYS.soloResults, []));
  }, [clearTimer]);

  const restartQuick = useCallback(() => {
    startTest();
  }, [startTest]);

  const clearResults = useCallback(() => {
    if (!window.confirm("Barcha natijalarni o'chirmoqchimisiz?")) return;
    saveJson(STORAGE_KEYS.soloResults, []);
    setHistory([]);
  }, []);

  const grade = phase === 'result' ? soloGrade(score, SOLO_TOTAL) : null;
  const maxT = soloMaxTimeSeconds(difficulty);
  const pctT = maxT > 0 ? timeLeft / maxT : 0;
  const timerStroke =
    pctT > 0.5 ? 'text-primary' : pctT > 0.25 ? 'text-amber-500' : 'text-rose-500';

  const ringDashoffset = 201 * (1 - pctT);

  return {
    phase,
    difficulty,
    setDifficulty,
    playerName,
    setPlayerName,
    nameError,
    questions,
    current,
    score,
    wrongCount,
    timeLeft,
    feedback,
    answerInput,
    setAnswerInput,
    inputStatus,
    history,
    grade,
    timerStroke,
    ringDashoffset,
    startTest,
    submitAnswer,
    restartFromMenu,
    restartQuick,
    clearResults,
    soloTotal: SOLO_TOTAL,
  };
}
