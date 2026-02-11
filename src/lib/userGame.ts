import { setUser } from "@/store/auth/authSlice";
import store from "@/store/store";

export type UserGameStats = {
  xp: number;
  level: number;
  quizzesPlayed: number;
  totalQuestions: number;
  totalAnswered: number;
  totalCorrect: number;
  totalWrong: number;
  lastPlayedAt?: number;
};

const DEFAULT_GAME: UserGameStats = {
  xp: 0,
  level: 1,
  quizzesPlayed: 0,
  totalQuestions: 0,
  totalAnswered: 0,
  totalCorrect: 0,
  totalWrong: 0,
  lastPlayedAt: undefined,
};

export function xpRequiredForLevel(level: number) {
  if (level <= 1) return 0;
  return (100 * (level - 1) * level) / 2;
}

export function xpRangeForLevel(level: number) {
  return Math.max(1, level) * 100;
}

export function calcLevelFromXp(xp: number) {
  const safeXp = Math.max(0, xp);
  const s = safeXp / 100;
  const root = (1 + Math.sqrt(1 + 8 * s)) / 2;
  return Math.max(1, Math.floor(root));
}

function calcXpGain({
  correct,
  wrong,
  accuracy,
  finishedBeforeTimeout,
}: {
  correct: number;
  wrong: number;
  accuracy: number;
  finishedBeforeTimeout: boolean;
}) {
  let xp = correct * 10 + wrong * 2;
  if (accuracy >= 0.8) xp += 20;
  if (finishedBeforeTimeout) xp += 10;
  return xp;
}

function safeReadUsers(): any[] {
  try {
    const raw = localStorage.getItem("users");
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeWriteUsers(users: any[]) {
  localStorage.setItem("users", JSON.stringify(users));
}

function normalizeGame(input: Partial<UserGameStats> | undefined): UserGameStats {
  const g = input ?? {};
  const xp = Number(g.xp ?? 0);
  return {
    xp,
    level: Number(g.level ?? calcLevelFromXp(xp)),
    quizzesPlayed: Number(g.quizzesPlayed ?? 0),
    totalQuestions: Number(g.totalQuestions ?? 0),
    totalAnswered: Number(g.totalAnswered ?? 0),
    totalCorrect: Number(g.totalCorrect ?? 0),
    totalWrong: Number(g.totalWrong ?? 0),
    lastPlayedAt: typeof g.lastPlayedAt === "number" ? g.lastPlayedAt : undefined,
  };
}

export function applyQuizResultToUser({
  userId,
  totalQuestions,
  answered,
  correct,
  wrong,
  finishedBeforeTimeout,
}: {
  userId: string;
  totalQuestions: number;
  answered: number;
  correct: number;
  wrong: number;
  finishedBeforeTimeout: boolean;
}) {
  const users = safeReadUsers();
  const idx = users.findIndex((u: any) => u?.id === userId);
  if (idx < 0) return null;

  const user = users[idx];
  const game = normalizeGame(user?.game ?? DEFAULT_GAME);

  const safeAnswered = Math.max(0, Number(answered) || 0);
  const safeCorrect = Math.max(0, Number(correct) || 0);
  const safeWrong = Math.max(0, Number(wrong) || 0);
  const safeTotalQuestions = Math.max(0, Number(totalQuestions) || 0);

  const accuracy = safeAnswered > 0 ? safeCorrect / safeAnswered : 0;
  const xpGain = calcXpGain({
    correct: safeCorrect,
    wrong: safeWrong,
    accuracy,
    finishedBeforeTimeout: !!finishedBeforeTimeout,
  });

  const nextXp = game.xp + xpGain;
  const nextLevel = calcLevelFromXp(nextXp);

  const nextGame: UserGameStats = {
    ...game,
    xp: nextXp,
    level: nextLevel,
    quizzesPlayed: game.quizzesPlayed + 1,
    totalQuestions: game.totalQuestions + safeTotalQuestions,
    totalAnswered: game.totalAnswered + safeAnswered,
    totalCorrect: game.totalCorrect + safeCorrect,
    totalWrong: game.totalWrong + safeWrong,
    lastPlayedAt: Date.now(),
  };

  const updatedUser = { ...user, game: nextGame };

  // persist + update store
  users[idx] = updatedUser;
  safeWriteUsers(users);
  store.dispatch(setUser(updatedUser));

  return { updatedUser, xpGain, nextGame };
}
