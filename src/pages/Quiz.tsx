import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import {
  answerCurrent,
  fetchQuiz,
  finishQuiz,
  nextQuestion,
  pauseTimer,
  resumeTimer,
  startQuiz,
} from "@/store/quiz/quizSlice";

export default function QuizPage() {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const quiz = useSelector((s: any) => s.quiz);

  /* =============================
   * SETTINGS
   * ============================= */
  const { mode, autoNextDelayMs } = useSelector((s: any) => s.settings);

  /* =============================
   * LOCAL STATE PER QUESTION
   * ============================= */
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const autoNextTimeoutRef = useRef<number | null>(null);

  const resetLocal = () => {
    setSelected(null);
    setRevealed(false);
  };

  // reset local state ketika soal berganti (jaga-jaga)
  useEffect(() => {
    resetLocal();

    if (autoNextTimeoutRef.current) {
      window.clearTimeout(autoNextTimeoutRef.current);
      autoNextTimeoutRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz.currentIndex]);

  /* =============================
   * TIMER TICK
   * ============================= */
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (quiz.status !== "in_progress") return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [quiz.status]);

  // IMPORTANT: perhitungan elapsed harus mengurangi paused duration
  const remainingSec = useMemo(() => {
    if (!quiz.startedAt) return quiz.durationSec;

    const pausedMsTotal = quiz.pausedMsTotal ?? 0;
    const pausedAt = quiz.pausedAt ?? null;

    const pausedSoFar = pausedMsTotal + (pausedAt ? now - pausedAt : 0);
    const elapsed = Math.floor((now - quiz.startedAt - pausedSoFar) / 1000);

    return Math.max(0, quiz.durationSec - elapsed);
  }, [now, quiz.startedAt, quiz.durationSec, quiz.pausedMsTotal, quiz.pausedAt]);

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
   * LOADING
   * ============================= */
  if (quiz.status === "loading" || !quiz.questions?.length) return <QuizSkeleton />;

  const q = quiz.questions[quiz.currentIndex];
  if (!q) return <QuizSkeleton />;

  const correctAnswer: string | undefined = q.correct_answer;

  const mm = String(Math.floor(remainingSec / 60)).padStart(2, "0");
  const ss = String(remainingSec % 60).padStart(2, "0");

  /* =============================
   * STYLING OPTIONS
   * - warna benar/salah HANYA muncul setelah revealed === true
   * ============================= */
  function getAnswerClass(a: string) {
    if (!revealed) {
      if (selected === a) return "!bg-green-400 !text-black";
      return "";
    }

    const isCorrect = a === correctAnswer;
    const isSelected = a === selected;

    if (isCorrect) return "!bg-green-600 !text-white hover:!bg-green-600 !border-green-600";
    if (isSelected && !isCorrect) return "!bg-red-600 !text-white hover:!bg-red-600 !border-red-600";
    return "";
  }

  /* =============================
   * NAV HELPERS (avoid green flash)
   * ============================= */
  const goNextClean = () => {
    // 1) hapus efek warna dulu (important)
    resetLocal();
    // 2) pindah soal
    dispatch(nextQuestion());
  };

  /* =============================
   * HANDLERS
   * ============================= */
  const handlePick = (a: string) => {
    if (revealed) return;

    if (mode === "manual") {
      setSelected(a);
      return;
    }

    // AUTO mode: pick => reveal => delay => next
    setSelected(a);
    setRevealed(true);

    // simpan jawaban tanpa advance
    dispatch(answerCurrent({ selected: a, advance: false }));

    autoNextTimeoutRef.current = window.setTimeout(() => {
      goNextClean();
    }, autoNextDelayMs);
  };

  const handleSubmit = () => {
    if (mode !== "manual") return;
    if (!selected || revealed) return;

    setRevealed(true);

    // simpan jawaban tanpa advance
    dispatch(answerCurrent({ selected, advance: false }));

    // pause timer (secara hitungan)
    dispatch(pauseTimer());
  };

  const handleContinue = () => {
    if (mode !== "manual") return;
    if (!revealed) return;

    // resume timer dulu, baru next
    dispatch(resumeTimer());
    goNextClean();
  };

  const showSubmit = mode === "manual" && !!selected && !revealed;
  const showContinue = mode === "manual" && revealed;

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
      {/* key={q.id} => memastikan remount saat soal berubah (anti “flash hijau”) */}
      <div key={q.id}>
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

          <CardContent className="space-y-3">
            <div className="text-lg leading-relaxed">{q.question}</div>

            <div className="grid gap-2">
              {q.answers.map((a: string) => (
                <Button
                  key={a}
                  variant="outline"
                  className={`justify-start ${getAnswerClass(a)}`}
                  onClick={() => handlePick(a)}
                  disabled={mode === "manual" && revealed} // manual: lock setelah submit
                >
                  {a}
                </Button>
              ))}
            </div>

            {showSubmit && (
              <Button onClick={handleSubmit} className="w-full">
                Submit
              </Button>
            )}

            {showContinue && (
              <Button onClick={handleContinue} className="w-full">
                Continue
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* =============================
 * SKELETON COMPONENT
 * ============================= */
function QuizSkeleton() {
  return (
    <div className="space-y-4">
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
