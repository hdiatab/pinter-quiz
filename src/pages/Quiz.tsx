// ==============================
// QuizPage.tsx (FULL FILE) — English version
// - Answers become 2 columns on screens >= sm
// - Progress indicators (small squares) above the question card
//   * Correct  -> green
//   * Wrong    -> red
//   * Unanswered -> border only
//   * Current  -> high-contrast + ring
// ==============================

import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
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

import { spendUserTokens } from "@/lib/userGame";
import PageTitle from "@/components/page-title";

export default function QuizPage() {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  const quiz = useSelector((s: any) => s.quiz);
  const { user } = useSelector((s: any) => s.auth);

  /* =============================
   * SETTINGS
   * ============================= */
  const { mode, autoNextDelayMs } = useSelector((s: any) => s.settings);

  /* =============================
   * LOCAL STATE PER QUESTION
   * ============================= */
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  // Hint: disabled answers on current question
  const [disabledAnswers, setDisabledAnswers] = useState<Set<string>>(new Set());

  const autoNextTimeoutRef = useRef<number | null>(null);

  const resetLocal = () => {
    setSelected(null);
    setRevealed(false);
    setDisabledAnswers(new Set());
  };

  // Reset local state when question changes (and cancel pending auto-next)
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
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [quiz.status]);

  // elapsed must subtract paused duration
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
   * SAFE QUESTION ACCESS (NO HOOK ORDER ISSUES)
   * ============================= */
  const isLoading = quiz.status === "loading";
  const hasQuestions = (quiz.questions?.length ?? 0) > 0;

  const q = useMemo(() => {
    if (!hasQuestions) return null;
    return quiz.questions[quiz.currentIndex] ?? null;
  }, [hasQuestions, quiz.questions, quiz.currentIndex]);

  const answers: string[] = useMemo(() => {
    return Array.isArray((q as any)?.answers) ? ((q as any).answers as string[]) : [];
  }, [q]);

  const correctAnswer: string | undefined = useMemo(() => {
    return (q as any)?.correct_answer ? String((q as any).correct_answer) : undefined;
  }, [q]);

  /* =============================
   * TOKENS / USER ID (ROBUST)
   * ============================= */
  const tokens = Number(user?.game?.tokens ?? 0);
  const userId = String(user?.id ?? user?._id ?? user?.uid ?? user?.userId ?? "").trim();

  /* =============================
   * HINT: disable 1 wrong answer
   * ============================= */
  const wrongOptionsLeft = useMemo(() => {
    if (!correctAnswer) return 0;
    return answers.filter((a) => a !== correctAnswer && !disabledAnswers.has(a)).length;
  }, [answers, correctAnswer, disabledAnswers]);

  const hintDisabledReason = useMemo(() => {
    if (revealed) return "Already revealed";
    if (!q) return "Question not ready";
    if (!correctAnswer) return "Correct answer missing";
    if (!userId) return "User ID missing";
    if (tokens <= 0) return "No tokens";
    if (wrongOptionsLeft <= 0) return "No wrong options left";
    return null;
  }, [revealed, q, correctAnswer, userId, tokens, wrongOptionsLeft]);

  const canUseHint = !hintDisabledReason;

  const handleHint = () => {
    if (!canUseHint) return;

    // Spend 1 token
    const spent = spendUserTokens({ userId, amount: 1 });
    if (!spent) return;

    // Pick one wrong answer that is still enabled
    const candidates = answers.filter((a) => a !== correctAnswer && !disabledAnswers.has(a));
    if (candidates.length === 0) return;

    const pick = candidates[Math.floor(Math.random() * candidates.length)];

    setDisabledAnswers((prev) => {
      const next = new Set(prev);
      next.add(pick);
      return next;
    });

    // If the user selected an answer that got disabled, clear it
    if (selected === pick) setSelected(null);
  };

  /* =============================
   * UI HELPERS
   * ============================= */
  const mm = String(Math.floor(remainingSec / 60)).padStart(2, "0");
  const ss = String(remainingSec % 60).padStart(2, "0");

  function getAnswerClass(a: string) {
    if (disabledAnswers.has(a)) return "opacity-50 pointer-events-none";

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
   * NAV HELPERS (avoid color flash)
   * ============================= */
  const goNextClean = () => {
    resetLocal();
    dispatch(nextQuestion());
  };

  /* =============================
   * HANDLERS
   * ============================= */
  const handlePick = (a: string) => {
    if (!q) return;
    if (revealed) return;
    if (disabledAnswers.has(a)) return;

    if (mode === "manual") {
      setSelected(a);
      return;
    }

    // AUTO mode: pick => reveal => delay => next
    setSelected(a);
    setRevealed(true);

    // Save answer without advancing
    dispatch(answerCurrent({ selected: a, advance: false }));

    autoNextTimeoutRef.current = window.setTimeout(() => {
      goNextClean();
    }, autoNextDelayMs);
  };

  const handleSubmit = () => {
    if (mode !== "manual") return;
    if (!selected || revealed) return;

    setRevealed(true);

    // Save answer without advancing
    dispatch(answerCurrent({ selected, advance: false }));

    // Pause timer (calculation-wise)
    dispatch(pauseTimer());
  };

  const handleContinue = () => {
    if (mode !== "manual") return;
    if (!revealed) return;

    // Resume then go next
    dispatch(resumeTimer());
    goNextClean();
  };

  const showSubmit = mode === "manual" && !!selected && !revealed;
  const showContinue = mode === "manual" && revealed;

  /* =============================
   * PROGRESS INDICATORS (SQUARES)
   * ============================= */

  // This reads the stored answer for any question by id.
  const getStoredAnswer = (questionId: string) => {
    const rec = (quiz.answers?.[questionId] ?? null) as {
      selected: string;
      correct: boolean;
      difficulty?: string;
    } | null;
    return rec;
  };

  const getIndicatorClass = (index: number) => {
    const qx = quiz.questions?.[index];
    if (!qx) return "border-muted-foreground/50";

    const rec = getStoredAnswer(qx.id);
    const isAnswered = !!rec;
    const isCorrect = !!rec?.correct;
    const isWrong = isAnswered && !isCorrect;
    const isCurrent = index === quiz.currentIndex;

    // base: small square with border
    let cls = "transition-all";

    // unanswered
    if (!isAnswered) {
      cls += " bg-transparent border-muted-foreground/50";
    }

    // answered
    if (isCorrect) cls += " bg-green-500 border-green-500";
    if (isWrong) cls += " bg-red-500 border-red-500";

    // current (active) highlight
    if (isCurrent) {
      if (!isAnswered) cls += " !bg-primary border-primary ring-2 ring-primary/30";
      else cls += " ring-2 ring-primary/30";
    }

    return cls;
  };

  /* =============================
   * RENDER (NO HOOKS BELOW THIS)
   * ============================= */
  if (isLoading || !hasQuestions || !q) return <QuizSkeleton />;

  return (
    <div className="space-y-4">
      <PageTitle title="Quiz" />
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-sm font-medium tabular-nums">
          {mm}:{ss}
        </div>

        <Button
          variant="outline"
          onClick={handleHint}
          disabled={!canUseHint}
          title={
            hintDisabledReason ? `Hint unavailable: ${hintDisabledReason}` : "Disable one wrong answer (costs 1 token)."
          }
        >
          Hint ({tokens})
        </Button>
      </div>

      {/* Progress indicators */}
      <div
        className="grid items-center gap-2"
        style={{
          gridTemplateColumns: `repeat(${
            quiz.totalCount > 34
              ? Math.ceil(quiz.totalCount / 3)
              : quiz.totalCount > 16
              ? Math.ceil(quiz.totalCount / 2)
              : quiz.totalCount
          }, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: quiz.totalCount }).map((_, i) => (
          <div key={i} className={`${getIndicatorClass(i)} rounded-full w-full border h-2`} />
        ))}
      </div>

      {/* Question Card */}
      <div key={(q as any).id}>
        <Card>
          <CardHeader className="space-y-1 max-md:hidden">
            <CardTitle className="text-base">
              Question {quiz.currentIndex + 1} / {quiz.totalCount}
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              {(q as any).category} · {(q as any).difficulty}
            </div>
          </CardHeader>

          <Separator className="max-md:hidden" />

          <CardContent className="space-y-4">
            <div className="text-lg leading-relaxed">{(q as any).question}</div>

            {/* ✅ 2 columns on sm+ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4">
              {answers.map((a: string) => (
                <Button
                  key={a}
                  variant="outline"
                  className={`justify-start ${getAnswerClass(a)} !h-fit whitespace-normal text-start`}
                  onClick={() => handlePick(a)}
                  disabled={(mode === "manual" && revealed) || disabledAnswers.has(a)}
                >
                  {a}
                </Button>
              ))}
            </div>

            <Button onClick={handleSubmit} className={`w-full ${showContinue ? "hidden" : ""}`} disabled={!showSubmit}>
              Submit
            </Button>

            {showContinue && (
              <Button onClick={handleContinue} className="w-full">
                Continue
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="fixed bottom-0 left-0 w-full h-fit bg-card z-10 p-4 rounded-t-lg md:hidden">
        <Button onClick={handleSubmit} className={`w-full ${showContinue ? "hidden" : ""}`} disabled={!showSubmit}>
          Submit
        </Button>

        {showContinue && (
          <Button onClick={handleContinue} className="w-full">
            Continue
          </Button>
        )}
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
