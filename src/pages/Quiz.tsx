import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { answerCurrent, fetchQuiz, finishQuiz, startQuiz } from "@/store/quiz/quizSlice";

export default function QuizPage() {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const quiz = useSelector((s: any) => s.quiz);

  /* =============================
   * TIMER (LIVE PER DETIK)
   * ============================= */
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (quiz.status !== "in_progress") return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [quiz.status]);

  const remainingSec = useMemo(() => {
    if (!quiz.startedAt) return quiz.durationSec;
    const elapsed = Math.floor((now - quiz.startedAt) / 1000);
    return Math.max(0, quiz.durationSec - elapsed);
  }, [now, quiz.startedAt, quiz.durationSec]);

  /* =============================
   * FETCH & START (GUARDED)
   * ============================= */
  useEffect(() => {
    if (quiz.status === "idle" && !quiz.questions?.length) {
      dispatch(fetchQuiz({ amount: 10, type: "multiple" }));
    }
  }, [dispatch, quiz.status, quiz.questions?.length]);

  useEffect(() => {
    if (quiz.status === "idle" && quiz.questions?.length) {
      dispatch(startQuiz({ durationSec: 120 }));
    }
  }, [dispatch, quiz.status, quiz.questions?.length]);

  /* =============================
   * FINISH WHEN TIME UP
   * ============================= */
  useEffect(() => {
    if (quiz.status !== "in_progress") return;
    if (remainingSec <= 0) {
      dispatch(finishQuiz());
      navigate("/quiz/result", { replace: true });
    }
  }, [dispatch, navigate, quiz.status, remainingSec]);

  useEffect(() => {
    if (quiz.status === "finished") {
      navigate("/quiz/result", { replace: true });
    }
  }, [quiz.status, navigate]);

  /* =============================
   * LOADING SKELETON
   * ============================= */
  if (quiz.status === "loading" || !quiz.questions?.length) {
    return <QuizSkeleton />;
  }

  const q = quiz.questions[quiz.currentIndex];
  if (!q) return <QuizSkeleton />;

  const mm = String(Math.floor(remainingSec / 60)).padStart(2, "0");
  const ss = String(remainingSec % 60).padStart(2, "0");

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Total: <span className="font-medium text-foreground">{quiz.totalCount}</span> · Answered:{" "}
          <span className="font-medium text-foreground">{quiz.answeredCount}</span>
        </div>

        <div className="text-sm font-medium tabular-nums">
          {mm}:{ss}
        </div>
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-base">
            Question {quiz.currentIndex + 1} / {quiz.totalCount}
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {q.category} · {q.difficulty}
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="space-y-3 pt-4">
          <div className="text-sm leading-relaxed">{q.question}</div>

          <div className="grid gap-2">
            {q.answers.map((a: string) => (
              <Button
                key={a}
                variant="outline"
                className="justify-start"
                onClick={() => dispatch(answerCurrent({ selected: a }))}
              >
                {a}
              </Button>
            ))}
          </div>

          <div className="text-xs text-muted-foreground">
            Selecting an answer will automatically move to the next question.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* =============================
 * SKELETON COMPONENT
 * ============================= */
function QuizSkeleton() {
  return (
    <div className="space-y-4">
      {/* Top bar skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-16" />
      </div>

      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </CardHeader>

        <Separator />

        <CardContent className="space-y-3 pt-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[80%]" />

          <div className="grid gap-2 pt-2">
            <Skeleton className="h-9 w-full rounded-md" />
            <Skeleton className="h-9 w-full rounded-md" />
            <Skeleton className="h-9 w-full rounded-md" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
