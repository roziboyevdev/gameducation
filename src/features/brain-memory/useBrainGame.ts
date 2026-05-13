import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BRAIN_MODES,
  brainPointsForAnswer,
  brainSessionGrade,
  generateBrainNumbers,
  sumNumbers,
  type BrainLbEntry,
  type BrainMode,
} from '@/features/brain-memory/brainLogic';
import { STORAGE_KEYS, loadJson, saveJson } from '@/shared/lib/persistence';
import { validatePlayerName } from '@/shared/lib/validators';

export type BrainPhase = 'menu' | 'game' | 'leaderboard';

export function useBrainGame() {
  const [phase, setPhase] = useState<BrainPhase>('menu');
  const [playerName, setPlayerName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [mode, setMode] = useState<BrainMode>('easy');

  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const [numsLabel, setNumsLabel] = useState('Tayyor?');
  const [numsState, setNumsState] = useState<'idle' | 'visible' | 'fading' | 'question'>('idle');

  const [showAnswerRow, setShowAnswerRow] = useState(false);
  const [answerInput, setAnswerInput] = useState('');
  const [answerCls, setAnswerCls] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const [timerPct, setTimerPct] = useState(1);
  const [timerLabel, setTimerLabel] = useState('10s');

  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [goLabel, setGoLabel] = useState('▶ BOSHLASH');

  const [sessionSummary, setSessionSummary] = useState<{ grade: string; icon: string } | null>(
    null,
  );

  const [leaderboardEntries, setLeaderboardEntries] = useState<BrainLbEntry[]>(() =>
    loadJson<BrainLbEntry[]>(STORAGE_KEYS.brainLeaderboard, []),
  );

  const correctRef = useRef(0);
  const timeoutsRef = useRef<number[]>([]);
  const answerTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
  }, []);

  const clearAnswerTimer = useCallback(() => {
    if (answerTimerRef.current) {
      clearInterval(answerTimerRef.current);
      answerTimerRef.current = null;
    }
  }, []);

  const refreshLeaderboardView = useCallback(() => {
    setLeaderboardEntries(loadJson<BrainLbEntry[]>(STORAGE_KEYS.brainLeaderboard, []));
  }, []);

  useEffect(
    () => () => {
      clearTimeouts();
      clearAnswerTimer();
    },
    [clearTimeouts, clearAnswerTimer],
  );

  const schedule = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timeoutsRef.current.push(id);
  };

  const initGame = useCallback(() => {
    const err = validatePlayerName(playerName);
    if (err) {
      setNameError(err);
      return;
    }
    setNameError(null);

    setScore(0);
    setCorrectCount(0);
    setStreak(0);
    setBestStreak(0);
    setNumsLabel('Tayyor?');
    setNumsState('idle');
    setShowAnswerRow(false);
    clearAnswerTimer();
    clearTimeouts();
    setFeedback(null);
    setGoLabel('▶ BOSHLASH');
    setPhase('game');
  }, [clearAnswerTimer, clearTimeouts, playerName]);

  const nextRound = useCallback(() => {
    clearTimeouts();
    clearAnswerTimer();

    const { showTimeMs, numCount } = BRAIN_MODES[mode];
    const nums = generateBrainNumbers(numCount);
    correctRef.current = sumNumbers(nums);

    setFeedback(null);
    setAnswerInput('');
    setAnswerCls('idle');
    setShowAnswerRow(false);
    setNumsState('visible');
    setNumsLabel(nums.join('  +  '));
    setGoLabel('▶ KEYINGISI');

    const fadeStart = Math.max(0, showTimeMs - 400);

    schedule(() => setNumsState('fading'), fadeStart);

    schedule(() => {
      setNumsState('question');
      setNumsLabel('???');

      setShowAnswerRow(true);
      let left = 10;
      setTimerPct(1);
      setTimerLabel(`${Math.ceil(left)}s`);

      answerTimerRef.current = setInterval(() => {
        left -= 0.1;
        const pct = Math.max(0, left / 10);
        setTimerPct(pct);
        setTimerLabel(`${Math.ceil(left)}s`);
        if (left <= 0) {
          clearAnswerTimer();
          setStreak(0);
          setAnswerCls('wrong');
          setFeedback({ ok: false, msg: `⏱ Vaqt tugadi! Javob: ${correctRef.current}` });
          schedule(() => nextRoundRef.current?.(), 1200);
        }
      }, 100);
    }, showTimeMs);
  }, [clearAnswerTimer, clearTimeouts, mode]);

  const nextRoundRef = useRef<(() => void) | undefined>(undefined);
  nextRoundRef.current = nextRound;

  const checkAnswer = useCallback(() => {
    clearAnswerTimer();
    clearTimeouts();

    const val = Number.parseInt(answerInput, 10);
    if (answerInput.trim() === '' || Number.isNaN(val)) return;

    const correctSum = correctRef.current;

    if (val === correctSum) {
      setCorrectCount((c) => c + 1);
      setStreak((prev) => {
        const pts = brainPointsForAnswer(prev);
        const ns = prev + 1;
        setScore((sc) => sc + pts);
        setBestStreak((b) => Math.max(b, ns));
        const bonus =
          ns > 2 ? `🔥 Ketma-ket ${ns}ta! +${pts} ball` : `✓ To'g'ri! +${pts} ball`;
        setFeedback({ ok: true, msg: bonus });
        return ns;
      });
      setAnswerCls('correct');
    } else {
      setStreak(0);
      setAnswerCls('wrong');
      setFeedback({ ok: false, msg: `✗ Xato! Javob: ${correctSum}` });
    }

    setShowAnswerRow(false);
    setGoLabel('▶ KEYINGISI');
  }, [answerInput, clearAnswerTimer, clearTimeouts]);

  const finishSession = useCallback(() => {
    clearTimeouts();
    clearAnswerTimer();

    const summary = brainSessionGrade(score);
    setSessionSummary(summary);

    const lb = loadJson<BrainLbEntry[]>(STORAGE_KEYS.brainLeaderboard, []);
    lb.push({
      name: playerName.trim(),
      score,
      mode: BRAIN_MODES[mode].label,
    });
    lb.sort((a, b) => b.score - a.score);
    saveJson(STORAGE_KEYS.brainLeaderboard, lb.slice(0, 10));

    refreshLeaderboardView();
    setPhase('leaderboard');
  }, [clearAnswerTimer, clearTimeouts, mode, playerName, refreshLeaderboardView, score]);

  const clearLb = useCallback(() => {
    if (!window.confirm("Barcha natijalarni o'chirmoqchimisiz?")) return;
    saveJson(STORAGE_KEYS.brainLeaderboard, []);
    refreshLeaderboardView();
  }, [refreshLeaderboardView]);

  const playAgain = useCallback(() => {
    setSessionSummary(null);
    initGame();
  }, [initGame]);

  const goMenu = useCallback(() => {
    setPhase('menu');
    clearTimeouts();
    clearAnswerTimer();
  }, [clearAnswerTimer, clearTimeouts]);

  const keyEnter = useCallback(() => {
    if (phase !== 'game') return;
    if (showAnswerRow) checkAnswer();
    else nextRound();
  }, [checkAnswer, nextRound, phase, showAnswerRow]);

  return {
    phase,
    playerName,
    setPlayerName,
    nameError,
    mode,
    setMode,
    score,
    correctCount,
    streak,
    bestStreak,
    numsLabel,
    numsState,
    showAnswerRow,
    answerInput,
    setAnswerInput,
    answerCls,
    timerPct,
    timerLabel,
    feedback,
    goLabel,
    initGame,
    nextRound,
    checkAnswer,
    finishSession,
    sessionSummary,
    leaderboardEntries,
    clearLb,
    playAgain,
    goMenu,
    keyEnter,
  };
}
