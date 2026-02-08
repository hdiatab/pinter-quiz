// src/pages/Quiz.tsx
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { answerCurrent, fetchQuiz, finishQuiz, startQuiz } from "@/store/quiz/quizSlice";

export default function QuizPage() {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const quiz = useSelector((s: any) => s.quiz);

  // fetch questions kalau belum ada
  useEffect(() => {
    if (!quiz.questions?.length && quiz.status !== "loading") {
      dispatch(fetchQuiz({ amount: 10, type: "multiple" }));
    }
  }, [dispatch, quiz.questions?.length, quiz.status]);

  // auto start kalau sudah ada questions dan belum in_progress/finished
  useEffect(() => {
    if (quiz.questions?.length && quiz.status === "idle") {
      dispatch(startQuiz({ durationSec: 120 })); // bebas
    }
  }, [dispatch, quiz.questions?.length, quiz.status]);

  // timer tick
  const remainingSec = useMemo(() => {
    if (!quiz.startedAt) return quiz.durationSec;
    const elapsed = Math.floor((Date.now() - quiz.startedAt) / 1000);
    return Math.max(0, quiz.durationSec - elapsed);
  }, [quiz.startedAt, quiz.durationSec, quiz.currentIndex]); // currentIndex triggers rerender on answer

  useEffect(() => {
    if (quiz.status !== "in_progress") return;

    const id = setInterval(() => {
      const elapsed = quiz.startedAt ? Math.floor((Date.now() - quiz.startedAt) / 1000) : 0;
      const left = quiz.durationSec - elapsed;
      if (left <= 0) {
        dispatch(finishQuiz());
        navigate("/quiz/result", { replace: true });
      }
    }, 250);

    return () => clearInterval(id);
  }, [dispatch, navigate, quiz.status, quiz.startedAt, quiz.durationSec]);

  useEffect(() => {
    if (quiz.status === "finished") navigate("/quiz/result", { replace: true });
  }, [quiz.status, navigate]);

  const q = quiz.questions?.[quiz.currentIndex];
  if (!q) {
    return <div className="text-sm text-muted-foreground">Loading questions…</div>;
  }

  const mm = String(Math.floor(remainingSec / 60)).padStart(2, "0");
  const ss = String(remainingSec % 60).padStart(2, "0");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Total: <span className="text-foreground font-medium">{quiz.totalCount}</span> · Answered:{" "}
          <span className="text-foreground font-medium">{quiz.answeredCount}</span>
        </div>
        <div className="text-sm">
          Time:{" "}
          <span className="font-medium tabular-nums">
            {mm}:{ss}
          </span>
        </div>
      </div>

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
