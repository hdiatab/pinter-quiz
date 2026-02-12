import { Fragment, useEffect, useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
  profileImage?: string | null;
  game?: Partial<UserGameStats>;
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

function getRankColor(index: number) {
  if (index === 0) return "text-yellow-500 font-semibold text-xl"; // Gold
  if (index === 1) return "text-gray-400 font-semibold text-lg"; // Silver
  if (index === 2) return "text-amber-700 font-semibold text-md"; // Bronze
  return "text-muted-foreground text-sm";
}

function getInitials(name?: string) {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
}

function formatNumber(n: number) {
  return new Intl.NumberFormat().format(n);
}

export default function LeaderboardsPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem("users");
    const parsed = raw ? JSON.parse(raw) : [];
    setUsers(Array.isArray(parsed) ? parsed : []);
  }, []);

  const ranked = useMemo(() => {
    return [...users]
      .map((u) => {
        const g = { ...defaultGame(), ...(u.game ?? {}) };
        const answered = g.totalAnswered || 0;
        const correct = g.totalCorrect || 0;
        const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;

        return {
          ...u,
          _game: g,
          _accuracy: accuracy,
        };
      })
      .sort((a, b) => (b._game.xp ?? 0) - (a._game.xp ?? 0));
  }, [users]);

  return (
    <div className="w-full max-w-2xl space-y-6 mx-auto">
      <div className="w-full space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">Top Performers</h1>
          <p className="text-muted-foreground text-sm">Quiz leaderboard based on XP and overall performance</p>
        </div>

        <Card>
          <CardHeader className="sr-only">
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>Quiz leaderboard based on XP and overall performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {ranked.length === 0 ? (
              <p className="text-sm text-muted-foreground">No users found.</p>
            ) : (
              ranked.map((u, index) => {
                const xp = u._game.xp ?? 0;
                const level = u._game.level ?? 1;
                const quizzesPlayed = u._game.quizzesPlayed ?? 0;

                const isLast = index === ranked.length - 1;

                return (
                  <Fragment key={index}>
                    <div key={u.id} className="flex items-center gap-4">
                      {/* Rank */}
                      <span className={`w-6 text-center tabular-nums ${getRankColor(index)}`}>{index + 1}</span>

                      {/* Avatar */}
                      <Avatar className="size-10">
                        {u.profileImage ? (
                          <AvatarImage src={u.profileImage} alt={u.name} className="object-cover" />
                        ) : null}
                        <AvatarFallback>{getInitials(u.name)}</AvatarFallback>
                      </Avatar>

                      {/* Name + meta */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{u.name || "Unnamed"}</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {u.email || "-"}
                          <span className="mx-2">·</span>
                          {u._accuracy}% accuracy
                          <span className="mx-2">·</span>
                          {quizzesPlayed} quizzes
                        </p>
                      </div>

                      {/* Right side: Level + XP */}
                      <span className="text-sm font-semibold tabular-nums">
                        Lv {level} · {formatNumber(xp)} XP
                      </span>
                    </div>

                    {!isLast && <Separator />}
                  </Fragment>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
