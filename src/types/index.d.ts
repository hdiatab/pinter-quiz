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

type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  profileImage?: string | null;
  coverImage?: string | null;

  game?: UserGameStats;
};
