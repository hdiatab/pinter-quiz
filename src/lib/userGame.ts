import { setUser } from "@/store/auth/authSlice";
import store from "@/store/store";

type UserGameStats = {
  xp: number;
  level: number;
  quizzesPlayed: number;
  totalQuestions: number;
  totalAnswered: number;
  totalCorrect: number;
  totalWrong: number;
  lastPlayedAt?: number;
};

const defaultGame = (): UserGameStats => ({
  xp: 0,
  level: 1,
  quizzesPlayed: 0,
  totalQuestions: 0,
  totalAnswered: 0,
  totalCorrect: 0,
  totalWrong: 0,
  lastPlayedAt: undefined,
});

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

function calcLevelFromXp(xp: number) {
  return Math.floor(xp / 200) + 1;
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
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const idx = users.findIndex((u: any) => u.id === userId);
  if (idx < 0) return null;

  const user = users[idx];
  const game: UserGameStats = user.game ? user.game : defaultGame();

  const accuracy = answered > 0 ? correct / answered : 0;
  const xpGain = calcXpGain({ correct, wrong, accuracy, finishedBeforeTimeout });

  const nextXp = (game.xp || 0) + xpGain;
  const nextLevel = calcLevelFromXp(nextXp);

  const nextGame: UserGameStats = {
    ...game,
    xp: nextXp,
    level: nextLevel,
    quizzesPlayed: (game.quizzesPlayed || 0) + 1,
    totalQuestions: (game.totalQuestions || 0) + totalQuestions,
    totalAnswered: (game.totalAnswered || 0) + answered,
    totalCorrect: (game.totalCorrect || 0) + correct,
    totalWrong: (game.totalWrong || 0) + wrong,
    lastPlayedAt: Date.now(),
  };

  const updatedUser = { ...user, game: nextGame };
  store.dispatch(setUser(updatedUser));
  users[idx] = updatedUser;
  localStorage.setItem("users", JSON.stringify(users));

  return { updatedUser, xpGain };
}
