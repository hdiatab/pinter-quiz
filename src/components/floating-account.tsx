// components/FloatingAccount.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Progress } from "./ui/progress";
import { useInitials } from "@/hooks/use-initials";

import { calcLevelFromXp, xpRequiredForLevel, xpRangeForLevel } from "@/lib/userGame";
import { FullscreenToggleButton } from "./fullscreen-toggle";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

export function FloatingAccount({ ...props }: React.ComponentProps<"div">) {
  const { user } = useSelector((state: any) => state.auth);
  const getInitials = useInitials();
  const location = useLocation();
  const navigate = useNavigate();
  const quiz = useSelector((s: any) => s.quiz);

  const xpTotal = Number(user?.game?.xp ?? 0);
  const level = calcLevelFromXp(xpTotal);
  const levelStartXp = xpRequiredForLevel(level);
  const levelSize = xpRangeForLevel(level);
  const xpInLevel = Math.max(0, xpTotal - levelStartXp);
  const progress = Math.min(100, Math.round((xpInLevel / levelSize) * 100));

  const isInQuiz = location.pathname === "/quiz";
  const hasQuestions = (quiz.questions?.length ?? 0) > 0;

  const q = React.useMemo(() => {
    if (!hasQuestions) return null;
    return quiz.questions[quiz.currentIndex] ?? null;
  }, [hasQuestions, quiz.questions, quiz.currentIndex]);

  return (
    <div className={"fixed top-4 left-1/2 z-50 w-full -translate-x-1/2"} {...props}>
      <nav className="m-4 flex items-center justify-between gap-2" aria-label="Quick navigation">
        {/* Left: Avatar */}

        {isInQuiz ? (
          <Button onClick={() => navigate(-1)} variant={"ghost"} className="border rounded-full !size-10" size={"icon"}>
            <ArrowLeft />
          </Button>
        ) : (
          <Link to={"/account"} className="shrink-0">
            <Avatar className="size-10 rounded-full">
              <AvatarImage src={user?.profileImage} alt={user?.name} />
              <AvatarFallback className="rounded-lg">{getInitials(user?.name)}</AvatarFallback>
            </Avatar>
          </Link>
        )}

        {/* Middle: Level Progress */}
        {isInQuiz && quiz.totalCount === 0 ? (
          <div className="flex flex-col gap-2 grow items-center">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        ) : isInQuiz ? (
          <div className="text-center">
            <p className="text-base font-semibold">
              Question {quiz.currentIndex + 1} / {quiz.totalCount}
            </p>
            {q !== null && (
              <p className="text-sm text-muted-foreground">
                {(q as any).category} · {(q as any).difficulty}
              </p>
            )}
          </div>
        ) : (
          <div className="flex w-full items-center gap-3 rounded-full p-2">
            <div className="shrink-0 text-xs font-medium text-muted-foreground">
              Lv <span className="text-foreground">{level}</span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Lvl Progress</span>
                <span className="text-[11px] text-muted-foreground tabular-nums">
                  {xpInLevel}/{levelSize} XP
                </span>
              </div>

              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                <Progress className="h-full rounded-full" value={progress} />
              </div>
            </div>

            <div className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">{xpTotal} XP</div>
          </div>
        )}

        {/* Right: Fullscreen toggle */}
        <FullscreenToggleButton className="!rounded-full size-10 shrink-0 border" />
      </nav>
    </div>
  );
}
