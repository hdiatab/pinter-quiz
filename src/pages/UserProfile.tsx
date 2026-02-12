import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import DEFAULT_COVER from "@/assets/subtle-prism.svg";
import { AccountStats } from "@/components/account-stats";
import PageTitle from "@/components/page-title";

function formatNumber(n: number) {
  return new Intl.NumberFormat().format(n);
}

function formatLastPlayed(ts?: number) {
  if (!ts) return "—";
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return "—";
  }
}

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);

  const coverImage = user?.coverImage || DEFAULT_COVER;
  const profileImage = user?.profileImage || null;

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const found = users.find((u: any) => String(u.id) === String(id));
    setUser(found || null);
  }, [id]);

  const g = user?.game ?? {};

  const quizzesPlayed = Number(g.quizzesPlayed ?? 0);
  const totalQuestions = Number(g.totalQuestions ?? 0);
  const totalAnswered = Number(g.totalAnswered ?? 0);
  const totalCorrect = Number(g.totalCorrect ?? 0);
  const totalWrong = Number(g.totalWrong ?? 0);
  const lastPlayedAt = typeof g.lastPlayedAt === "number" ? g.lastPlayedAt : undefined;

  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  const bio = useMemo(() => {
    const b = (user?.bio ?? "").trim();
    return b.length ? b : "—";
  }, [user]);

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User not found</CardTitle>
          <CardDescription>The user you’re looking for doesn’t exist.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageTitle title={user?.name || "Profile"} />

      {/* Header card (cover + avatar) */}
      <Card className="overflow-hidden pt-0">
        <div
          className="relative h-32 bg-muted bg-cover bg-center sm:h-40"
          style={{ backgroundImage: `url("${coverImage}")` }}
        >
          <div className="absolute inset-0 bg-black/20" />
          {/* tombol upload dihapus */}
        </div>

        <CardContent className="px-6 -mt-12 pb-0 sm:-mt-14">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
            {/* Avatar (read-only) */}
            <div className="relative">
              <div className="relative size-24 overflow-hidden rounded-full border-4 border-card shadow-lg sm:size-28">
                {profileImage ? (
                  <img src={profileImage} alt={user?.name ?? "Profile"} className="h-full w-full object-cover" />
                ) : (
                  <div className="bg-muted flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                    No photo
                  </div>
                )}
              </div>
              {/* tombol upload avatar dihapus */}
            </div>

            {/* Name + email + bio (bio pindah ke bawah nama) */}
            <div className="space-y-1 text-center sm:pb-1 sm:text-left">
              <div className="flex gap-2 items-center flex-col sm:flex-row">
                <h3 className="text-lg font-semibold">{user?.name ?? "—"}</h3>
                <p className="text-sm text-muted-foreground">({user?.email ?? "—"})</p>
              </div>

              <p className="text-sm text-foreground/90 max-w-[52ch]">{bio}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Account Stats</CardTitle>
          <CardDescription>User level progress and total XP</CardDescription>
        </CardHeader>
        <CardContent>
          {/* kalau AccountStats hanya baca user dari redux, ini akan menampilkan stats milik user login.
              Kalau mau stats user lain, kamu perlu bikin versi AccountStats yang menerima props user/game.
              Untuk saat ini aku tetap pakai komponen existing kamu. */}
          <AccountStats className="w-full" user={user} />
        </CardContent>
      </Card>

      {/* Game Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Game Summary</CardTitle>
          <CardDescription>Quick overview of quiz performance</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-3 grid-cols-2">
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Accuracy</p>
              <p className="text-2xl font-semibold tabular-nums">{accuracy}%</p>
            </div>

            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Quizzes Played</p>
              <p className="text-2xl font-semibold tabular-nums">{formatNumber(quizzesPlayed)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Answered</p>
              <p className="text-base font-semibold tabular-nums">{formatNumber(totalAnswered)}</p>
            </div>

            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Correct</p>
              <p className="text-base font-semibold tabular-nums">{formatNumber(totalCorrect)}</p>
            </div>

            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Wrong</p>
              <p className="text-base font-semibold tabular-nums">{formatNumber(totalWrong)}</p>
            </div>

            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Total Questions</p>
              <p className="text-base font-semibold tabular-nums">{formatNumber(totalQuestions)}</p>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Last played: <span className="text-foreground">{formatLastPlayed(lastPlayedAt)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Form edit (bio/password) DIHILANGKAN total */}
    </div>
  );
}
