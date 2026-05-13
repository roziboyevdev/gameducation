import { useCallback, useState } from 'react';
import { generateBattleQuestion, type BattleOp } from '@/features/battle/battleLogic';
import { validatePlayerName } from '@/shared/lib/validators';

export type BattlePhase = 'setup' | 'game' | 'win';

export function useBattleGame() {
  const [phase, setPhase] = useState<BattlePhase>('setup');
  const [p1Name, setP1Name] = useState('');
  const [p2Name, setP2Name] = useState('');
  const [err1, setErr1] = useState<string | null>(null);
  const [err2, setErr2] = useState<string | null>(null);

  const [activeOps, setActiveOps] = useState<BattleOp[]>(['+']);
  const [targetPos, setTargetPos] = useState(10);

  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [pos1, setPos1] = useState(0);
  const [pos2, setPos2] = useState(0);
  const [currentTurn, setCurrentTurn] = useState<1 | 2>(1);
  const [wins, setWins] = useState<Record<string, number>>({});

  const [qa, setQa] = useState(0);
  const [qb, setQb] = useState(0);
  const [qOp, setQOp] = useState<BattleOp>('+');
  const [qAns, setQAns] = useState(0);

  const [answerInput, setAnswerInput] = useState('');
  const [feed, setFeed] = useState<{ ok: boolean; msg: string } | null>(null);
  const [inputCls, setInputCls] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const [winnerName, setWinnerName] = useState('');
  const [winnerSlot, setWinnerSlot] = useState<1 | 2>(1);

  const toggleOp = useCallback((op: BattleOp) => {
    setActiveOps((prev) => {
      if (prev.includes(op)) {
        if (prev.length === 1) return prev;
        return prev.filter((o) => o !== op);
      }
      return [...prev, op];
    });
  }, []);

  const newQuestion = useCallback(() => {
    const q = generateBattleQuestion(activeOps);
    setQa(q.qa);
    setQb(q.qb);
    setQOp(q.qOp);
    setQAns(q.qAns);
    setAnswerInput('');
    setFeed(null);
    setInputCls('idle');
  }, [activeOps]);

  const startGame = useCallback(() => {
    const n1 = p1Name.trim();
    const n2 = p2Name.trim();
    const e1 = validatePlayerName(n1, 1);
    const e2 = validatePlayerName(n2, 2);
    setErr1(e1);
    setErr2(e2);
    if (e1 || e2) return;
    if (n1.toLowerCase() === n2.toLowerCase()) {
      setErr2("Ikki o'yinchi ismi har xil bo'lsin!");
      return;
    }

    setP1(n1);
    setP2(n2);
    setWins((w) => ({ ...w, [n1]: w[n1] ?? 0, [n2]: w[n2] ?? 0 }));
    setPos1(0);
    setPos2(0);
    setCurrentTurn(1);

    const q = generateBattleQuestion(activeOps);
    setQa(q.qa);
    setQb(q.qb);
    setQOp(q.qOp);
    setQAns(q.qAns);
    setAnswerInput('');
    setFeed(null);
    setInputCls('idle');

    setPhase('game');
  }, [activeOps, p1Name, p2Name]);

  const winGame = useCallback((who: 1 | 2) => {
    const winner = who === 1 ? p1 : p2;
    setWinnerSlot(who);
    setWinnerName(winner);
    setWins((prev) => ({
      ...prev,
      [winner]: (prev[winner] ?? 0) + 1,
    }));
    setPhase('win');
  }, [p1, p2]);

  const checkAnswer = useCallback(() => {
    if (answerInput.trim() === '') return;
    const val = Number.parseInt(answerInput, 10);
    if (Number.isNaN(val)) return;

    const ok = val === qAns;
    const np1 = ok && currentTurn === 1 ? pos1 + 1 : pos1;
    const np2 = ok && currentTurn === 2 ? pos2 + 1 : pos2;

    if (ok) {
      setInputCls('correct');
      setFeed({ ok: true, msg: "✓ To'g'ri!" });
      if (currentTurn === 1) setPos1(np1);
      else setPos2(np2);
    } else {
      setInputCls('wrong');
      setFeed({ ok: false, msg: `✗ Xato! Javob: ${qAns}` });
    }

    window.setTimeout(() => {
      if (np1 >= targetPos) {
        winGame(1);
        return;
      }
      if (np2 >= targetPos) {
        winGame(2);
        return;
      }
      setCurrentTurn((prev) => (prev === 1 ? 2 : 1));
      newQuestion();
    }, 700);
  }, [
    answerInput,
    currentTurn,
    newQuestion,
    pos1,
    pos2,
    qAns,
    targetPos,
    winGame,
  ]);

  const rematch = useCallback(() => {
    setPos1(0);
    setPos2(0);
    setCurrentTurn(1);
    newQuestion();
    setPhase('game');
  }, [newQuestion]);

  const backSetup = useCallback(() => {
    setPhase('setup');
  }, []);

  const leaderboard = Object.entries(wins).sort((a, b) => b[1] - a[1]);

  return {
    phase,
    p1Name,
    setP1Name,
    p2Name,
    setP2Name,
    err1,
    err2,
    activeOps,
    toggleOp,
    targetPos,
    setTargetPos,
    p1,
    p2,
    pos1,
    pos2,
    currentTurn,
    qa,
    qb,
    qOp,
    answerInput,
    setAnswerInput,
    feed,
    inputCls,
    winnerName,
    winnerSlot,
    leaderboard,
    startGame,
    checkAnswer,
    rematch,
    backSetup,
  };
}
