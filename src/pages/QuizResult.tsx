// ResultPage.tsx (FULL FILE) — English version
// - Difficulty-based XP (requires passing quiz.answers)
// - Stars based on accuracy (5 perfect, 4 >=80%, 3 >=60%, 2 >=40%, 1 >0, 0 otherwise)
// - Shows XP gained, tokens gained, level up info
// - BIG 5-burst confetti when level up (reliable: uses its own fullscreen canvas + zIndex 9999)
// - Also confetti when perfect (smaller)

import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { Trophy, Sparkles, ArrowUp, Coins, Timer, CheckCircle2, XCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { resetQuiz } from "@/store/quiz/quizSlice";
import { applyQuizResultToUser } from "@/lib/userGame";
import { toast } from "sonner";
import { StarRating } from "@/components/ui/star-rating";

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function getStarsFromAccuracy(accuracy: number) {
  if (accuracy >= 1) return 5;
  if (accuracy >= 0.8) return 4;
  if (accuracy >= 0.6) return 3;
  if (accuracy >= 0.4) return 2;
  if (accuracy > 0) return 1;
  return 0;
}

function formatPct(n: number) {
  return `${Math.round(clamp01(n) * 100)}%`;
}

// ✅ Reliable level-up confetti: create our own fullscreen canvas with high z-index.
function fireLevelUpConfetti() {
  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "9999";
  document.body.appendChild(canvas);

  const myConfetti = confetti.create(canvas, { resize: true, useWorker: true });

  // 5 bursts with different timing + intensity
  const bursts = [
    { delay: 0, particleCount: 140, spread: 80, startVelocity: 55, origin: { x: 0.2, y: 0.25 } },
    { delay: 180, particleCount: 160, spread: 90, startVelocity: 60, origin: { x: 0.8, y: 0.25 } },
    { delay: 360, particleCount: 180, spread: 100, startVelocity: 62, origin: { x: 0.5, y: 0.2 } },
    { delay: 650, particleCount: 160, spread: 85, startVelocity: 58, origin: { x: 0.35, y: 0.3 } },
    { delay: 900, particleCount: 220, spread: 110, startVelocity: 65, origin: { x: 0.65, y: 0.3 } },
  ];

  bursts.forEach((b) => {
    window.setTimeout(() => {
      myConfetti({
        particleCount: b.particleCount,
        spread: b.spread,
        startVelocity: b.startVelocity,
        origin: b.origin,
      });
    }, b.delay);
  });

  // Optional “rain” finish
  window.setTimeout(() => {
    myConfetti({
      particleCount: 120,
      spread: 140,
      startVelocity: 25,
      origin: { x: 0.5, y: 0 },
    });
  }, 1200);

  // Cleanup
  window.setTimeout(() => {
    myConfetti.reset();
    canvas.remove();
  }, 4000);
}

function firePerfectConfetti() {
  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "9999";
  document.body.appendChild(canvas);

  const myConfetti = confetti.create(canvas, { resize: true, useWorker: true });

  myConfetti({
    particleCount: 140,
    spread: 90,
    startVelocity: 55,
    origin: { x: 0.5, y: 0.25 },
  });

  window.setTimeout(() => {
    myConfetti.reset();
    canvas.remove();
  }, 1600);
}

type AppliedRewardPayload = {
  xpGain: number;
  tokenGain: number;
  perfectTokenGain: number;
  levelUpTokenGain: number;
  levelGained: number;
  accuracy: number;
  nextGame?: { level: number; xp: number; tokens: number };
};

export default function ResultPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const quiz = useSelector((s: any) => s.quiz);

  const didApplyRef = useRef(false);
  const [reward, setReward] = useState<AppliedRewardPayload | null>(null);

  const userId = useMemo(() => {
    // Must match users[].id stored in localStorage "users"
    return (localStorage.getItem("loggedInUser") || sessionStorage.getItem("loggedInUser") || "").trim();
  }, []);

  const answered = Number(quiz.answeredCount ?? 0);
  const total = Number(quiz.totalCount ?? 0);
  const correct = Number(quiz.correctCount ?? 0);
  const wrong = Number(quiz.wrongCount ?? 0);

  const accuracy = useMemo(() => (answered > 0 ? correct / answered : 0), [answered, correct]);
  const stars = useMemo(() => getStarsFromAccuracy(accuracy), [accuracy]);

  const finishedBeforeTimeout = useMemo(() => {
    const startedAt = Number(quiz.startedAt ?? 0);
    const finishedAt = Number(quiz.finishedAt ?? 0);
    const durationSec = Number(quiz.durationSec ?? 0);
    if (!startedAt || !finishedAt || !durationSec) return false;
    return Math.floor((finishedAt - startedAt) / 1000) < durationSec;
  }, [quiz.startedAt, quiz.finishedAt, quiz.durationSec]);

  const isPerfect = useMemo(() => {
    return total > 0 && answered === total && correct === total && wrong === 0;
  }, [total, answered, correct, wrong]);

  // ✅ Apply results ONCE and store payload so UI can show exact numbers
  useEffect(() => {
    if (!userId) return;
    if (!quiz?.startedAt) return;
    if (didApplyRef.current) return;

    const key = `quiz_result_applied_${quiz.startedAt}`;
    const payloadKey = `${key}_payload`;

    // If already applied (refresh/revisit), read cached payload (so UI still shows rewards)
    const cached = sessionStorage.getItem(payloadKey);
    if (sessionStorage.getItem(key) && cached) {
      try {
        setReward(JSON.parse(cached));
      } catch {
        // ignore
      }
      didApplyRef.current = true;
      return;
    }

    // ✅ REQUIRED for difficulty-based XP:
    const res = applyQuizResultToUser({
      userId,
      totalQuestions: total,
      answered,
      correct,
      wrong,
      finishedBeforeTimeout: !!finishedBeforeTimeout,
      answersByQuestionId: quiz.answers ?? {}, // ✅ IMPORTANT
    });

    didApplyRef.current = true;

    if (!res) return;

    const levelUp = Number(res.levelGained ?? 0) > 0;

    const payload: AppliedRewardPayload = {
      xpGain: Number(res.xpGain ?? 0),
      tokenGain: Number(res.tokenGain ?? 0),
      perfectTokenGain: Number(res.perfectTokenGain ?? 0),
      levelUpTokenGain: Number(res.levelUpTokenGain ?? 0),
      levelGained: Number(res.levelGained ?? 0),
      accuracy: Number(res.accuracy ?? accuracy),
      nextGame: res.nextGame
        ? { level: res.nextGame.level, xp: res.nextGame.xp, tokens: res.nextGame.tokens }
        : undefined,
    };

    setReward(payload);

    sessionStorage.setItem(key, "1");
    sessionStorage.setItem(payloadKey, JSON.stringify(payload));

    // Toast
    const parts: string[] = [];
    parts.push(`+${payload.xpGain} XP`);
    if (payload.tokenGain > 0) parts.push(`+${payload.tokenGain} tokens`);
    if (payload.levelGained > 0) parts.push(`Level Up +${payload.levelGained}`);
    toast.success(parts.join(" · "));

    // 🎉 Confetti (delay a bit so DOM paints)
    if (levelUp) {
      requestAnimationFrame(() => setTimeout(() => fireLevelUpConfetti(), 150));
    } else if (isPerfect) {
      requestAnimationFrame(() => setTimeout(() => firePerfectConfetti(), 120));
    }
  }, [
    userId,
    quiz.startedAt,
    total,
    answered,
    correct,
    wrong,
    finishedBeforeTimeout,
    quiz.answers,
    accuracy,
    isPerfect,
  ]);

  const titleText = useMemo(() => {
    if (stars === 5) return "Perfect Run!";
    if (stars === 4) return "Great Job!";
    if (stars === 3) return "Nice Work!";
    if (stars === 2) return "Keep Going!";
    if (stars === 1) return "Good Start!";
    return "Try Again!";
  }, [stars]);

  const subtitleText = useMemo(() => {
    if (stars === 5) return "You answered everything correctly. Massive W.";
    if (stars === 4) return "Strong accuracy — you're close to perfect.";
    if (stars === 3) return "Solid result. A bit more focus and you’ll level faster.";
    if (stars === 2) return "You’re getting there. Improve accuracy for bonus XP.";
    if (stars === 1) return "You’ve started — keep practicing.";
    return "No answers recorded. Try again and submit answers.";
  }, [stars]);

  const handleTryAgain = () => {
    dispatch(resetQuiz());
    navigate("/quiz");
  };

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardHeader className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                {titleText}
              </CardTitle>
              <div className="text-sm text-muted-foreground">{subtitleText}</div>
            </div>

            <Badge variant="outline" className="gap-1">
              <Sparkles className="h-4 w-4" />
              Accuracy {formatPct(accuracy)}
            </Badge>
          </div>

          <div className="pt-1">
            <StarRating defaultValue={stars} disabled size="lg" className="gap-1" />
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="space-y-4 pt-6">
          {/* Score grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <motion.div
              className="rounded-lg border p-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="text-xs text-muted-foreground">Answered</div>
              <div className="mt-1 text-2xl font-semibold tabular-nums">
                {answered} <span className="text-muted-foreground text-base">/ {total}</span>
              </div>
            </motion.div>

            <motion.div
              className="rounded-lg border p-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.05 }}
            >
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">Correct</div>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <div className="mt-1 text-2xl font-semibold tabular-nums">{correct}</div>
            </motion.div>

            <motion.div
              className="rounded-lg border p-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">Wrong</div>
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
              <div className="mt-1 text-2xl font-semibold tabular-nums">{wrong}</div>
            </motion.div>
          </div>

          {/* Time badge */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1">
              <Timer className="h-4 w-4" />
              {finishedBeforeTimeout ? "Finished in time" : "Time over or unknown"}
            </Badge>

            {reward?.levelGained ? (
              <Badge className="gap-1">
                <ArrowUp className="h-4 w-4" />
                Level Up +{reward.levelGained}
              </Badge>
            ) : null}

            {reward?.tokenGain ? (
              <Badge className="gap-1" variant="outline">
                <Coins className="h-4 w-4" />+{reward.tokenGain} Tokens
              </Badge>
            ) : null}
          </div>

          {/* Rewards panel with exact numbers */}
          <RewardsPanel reward={reward} isPerfect={isPerfect} />

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button className="w-full sm:w-auto" variant="default" onClick={handleTryAgain}>
              Try Another Quiz
            </Button>

            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link to="/home">Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RewardsPanel({ reward, isPerfect }: { reward: AppliedRewardPayload | null; isPerfect: boolean }) {
  const xp = reward?.xpGain ?? 0;
  const tg = reward?.tokenGain ?? 0;
  const lv = reward?.levelGained ?? 0;
  const nextLevel = reward?.nextGame?.level;

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="font-semibold flex items-center gap-2">
          <ArrowUp className="h-4 w-4" />
          Rewards Summary
        </div>

        {nextLevel ? (
          <Badge variant="outline" className="gap-1">
            <Sparkles className="h-4 w-4" />
            Current Lv {nextLevel}
          </Badge>
        ) : null}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">XP Gained</div>
          <div className="text-xl font-semibold tabular-nums">+{xp}</div>
        </div>

        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">Tokens Gained</div>
          <div className="text-xl font-semibold tabular-nums">+{tg}</div>
        </div>

        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">Level Gained</div>
          <div className="text-xl font-semibold tabular-nums">{lv > 0 ? `+${lv}` : "—"}</div>
        </div>
      </div>

      {isPerfect ? (
        <div className="text-sm">
          <Badge className="mr-2">Perfect</Badge>
          You got everything correct — perfect bonus applied.
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">Tip: Aim for ≥ 80% accuracy to get bonus XP consistently.</div>
      )}

      <div className="text-xs text-muted-foreground">
        XP is computed per answered question and scaled by difficulty. Tokens come from perfect runs (+1) and level-ups
        (+5 per level).
      </div>
    </div>
  );
}
