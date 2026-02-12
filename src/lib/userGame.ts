// ==============================
// userGame.ts (FULL FILE) — English version
// Difficulty-based XP (easy < medium < hard)
// ==============================
import { setUser } from "@/store/auth/authSlice";
import store from "@/store/store";

export type UserGameStats = {
  xp: number;
  level: number;
  tokens: number; // tokens used for hints, etc.
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
  tokens: 0,
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

// ✅ difficulty weight helper
function difficultyMultiplier(difficulty: string) {
  const d = String(difficulty || "").toLowerCase();
  if (d === "hard") return 2.0;
  if (d === "medium") return 1.4;
  return 1.0; // easy / unknown
}

// ✅ XP is computed per answered question, scaled by difficulty
function calcXpGain({
  answersByQuestionId,
  finishedBeforeTimeout,
}: {
  answersByQuestionId: Record<string, { selected: string; correct: boolean; difficulty: string }>;
  finishedBeforeTimeout: boolean;
}) {
  const entries = Object.values(answersByQuestionId || {});
  const answered = entries.length;

  if (answered === 0) return 0;

  let xp = 0;
  let correct = 0;

  for (const a of entries) {
    const mult = difficultyMultiplier(a.difficulty);

    // base per question
    if (a.correct) {
      xp += 10 * mult;
      correct += 1;
    } else {
      xp += 2 * mult;
    }
  }

  const accuracy = correct / answered;

  // bonuses (optional but useful)
  if (accuracy >= 0.8) xp += 20;
  if (finishedBeforeTimeout) xp += 10;

  return Math.round(xp);
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
  const level = Number(g.level ?? calcLevelFromXp(xp));

  return {
    xp,
    level,
    tokens: Math.max(0, Number((g as any).tokens ?? 0)),
    quizzesPlayed: Number(g.quizzesPlayed ?? 0),
    totalQuestions: Number(g.totalQuestions ?? 0),
    totalAnswered: Number(g.totalAnswered ?? 0),
    totalCorrect: Number(g.totalCorrect ?? 0),
    totalWrong: Number(g.totalWrong ?? 0),
    lastPlayedAt: typeof g.lastPlayedAt === "number" ? g.lastPlayedAt : undefined,
  };
}

/**
 * Spend user tokens (e.g. for hints).
 * Returns null if user not found or insufficient tokens.
 */
export function spendUserTokens({ userId, amount }: { userId: string; amount: number }) {
  const spend = Math.max(0, Number(amount) || 0);
  if (spend <= 0) return null;

  const users = safeReadUsers();
  const idx = users.findIndex((u: any) => u?.id === userId);
  if (idx < 0) return null;

  const user = users[idx];
  const game = normalizeGame(user?.game ?? DEFAULT_GAME);

  if (game.tokens < spend) return null;

  const nextGame: UserGameStats = {
    ...game,
    tokens: game.tokens - spend,
  };

  const updatedUser = { ...user, game: nextGame };

  users[idx] = updatedUser;
  safeWriteUsers(users);
  store.dispatch(setUser(updatedUser));

  return { updatedUser, nextGame };
}

export function applyQuizResultToUser({
  userId,
  totalQuestions,
  answered,
  correct,
  wrong,
  finishedBeforeTimeout,
  answersByQuestionId, // ✅ NEW: required for difficulty-based XP
}: {
  userId: string;
  totalQuestions: number;
  answered: number;
  correct: number;
  wrong: number;
  finishedBeforeTimeout: boolean;
  answersByQuestionId: Record<string, { selected: string; correct: boolean; difficulty: string }>;
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

  const prevLevel = game.level;

  // ✅ difficulty-based XP
  const xpGain = calcXpGain({
    answersByQuestionId: answersByQuestionId || {},
    finishedBeforeTimeout: !!finishedBeforeTimeout,
  });

  const nextXp = game.xp + xpGain;
  const nextLevel = calcLevelFromXp(nextXp);

  // TOKEN REWARDS
  // +1 token if perfect quiz (answered all and all correct)
  const isPerfect =
    safeTotalQuestions > 0 &&
    safeAnswered === safeTotalQuestions &&
    safeCorrect === safeTotalQuestions &&
    safeWrong === 0;

  const perfectTokenGain = isPerfect ? 1 : 0;

  // +5 tokens per level gained
  const levelGained = Math.max(0, nextLevel - prevLevel);
  const levelUpTokenGain = levelGained * 5;

  const tokenGainTotal = perfectTokenGain + levelUpTokenGain;

  const nextGame: UserGameStats = {
    ...game,
    xp: nextXp,
    level: nextLevel,
    tokens: game.tokens + tokenGainTotal,
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

  return {
    updatedUser,
    xpGain,
    nextGame,
    tokenGain: tokenGainTotal,
    perfectTokenGain,
    levelUpTokenGain,
    levelGained,
    accuracy, // helpful for UI
  };
}
