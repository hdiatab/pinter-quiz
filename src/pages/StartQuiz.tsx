import { useEffect, useMemo, useState, useId } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { calcLevelFromXp } from "@/lib/userGame";
import { fetchQuiz, startQuiz } from "@/store/quiz/quizSlice";

type Difficulty = "easy" | "medium" | "hard";
type QType = "multiple" | "boolean";

type LastQuizMeta = {
  title: string;
  difficulty: Difficulty;
  categoryId?: number;
  categoryName?: string;
  amount?: number;
  type?: QType;
  playedAt: number;
};

// Same categories as Home (OpenTDB IDs)
const CATEGORIES: Array<{ id: number; name: string }> = [
  { id: 9, name: "General Knowledge" },
  { id: 10, name: "Entertainment: Books" },
  { id: 11, name: "Entertainment: Film" },
  { id: 12, name: "Entertainment: Music" },
  { id: 13, name: "Entertainment: Musicals & Theatres" },
  { id: 14, name: "Entertainment: Television" },
  { id: 15, name: "Entertainment: Video Games" },
  { id: 16, name: "Entertainment: Board Games" },
  { id: 17, name: "Science & Nature" },
  { id: 18, name: "Science: Computers" },
  { id: 19, name: "Science: Mathematics" },
  { id: 20, name: "Mythology" },
  { id: 21, name: "Sports" },
  { id: 22, name: "Geography" },
  { id: 23, name: "History" },
  { id: 24, name: "Politics" },
  { id: 25, name: "Art" },
  { id: 26, name: "Celebrities" },
  { id: 27, name: "Animals" },
  { id: 28, name: "Vehicles" },
  { id: 29, name: "Entertainment: Comics" },
  { id: 30, name: "Science: Gadgets" },
  { id: 31, name: "Entertainment: Japanese Anime & Manga" },
  { id: 32, name: "Entertainment: Cartoon & Animations" },
];

function titleCaseDifficulty(d: Difficulty) {
  return d.charAt(0).toUpperCase() + d.slice(1);
}

function typeLabel(t: QType) {
  return t === "multiple" ? "Multiple Choice" : "True / False";
}

function clamp(n: number, min: number, max: number) {
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}

/**
 * Level-based limits. Tweak these numbers to match your game's balancing.
 * - Lv <= 10: Easy only, up to 10 questions, up to 3 minutes
 * - Lv 11-29: Easy/Medium, up to 20 questions, up to 5 minutes
 * - Lv >= 30: Easy/Medium/Hard, up to 50 questions, up to 30 minutes
 */
function getQuizLimitsByLevel(level: number) {
  if (level <= 10) {
    return {
      allowedDifficulties: ["easy"] as Difficulty[],
      amountMin: 5,
      amountMax: 10,
      timeMinSec: 60,
      timeMaxSec: 180,
    };
  }
  if (level <= 29) {
    return {
      allowedDifficulties: ["easy", "medium"] as Difficulty[],
      amountMin: 5,
      amountMax: 20,
      timeMinSec: 60,
      timeMaxSec: 300,
    };
  }
  return {
    allowedDifficulties: ["easy", "medium", "hard"] as Difficulty[],
    amountMin: 5,
    amountMax: 50,
    timeMinSec: 60,
    timeMaxSec: 1800,
  };
}

/** Radio card group (split list style) */
function RadioCardGroup<T extends string>({
  value,
  onValueChange,
  items,
  ariaLabelPrefix = "radio",
  className,
}: {
  value: T;
  onValueChange: (v: T) => void;
  items: Array<{
    value: T;
    label: string;
    rightText?: string;
    badgeText?: string;
    disabled?: boolean;
  }>;
  ariaLabelPrefix?: string;
  className?: string;
}) {
  const id = useId();

  return (
    <RadioGroup
      className={className ?? "w-full gap-0 space-y-2 rounded-md *:rounded-full"}
      value={value}
      onValueChange={(v) => onValueChange(v as T)}
    >
      {items.map((item) => {
        const itemId = `${id}-${item.value}`;
        const rightId = `${itemId}-right`;

        return (
          <div
            key={itemId}
            className={[
              "border-input relative flex flex-col gap-4 border p-4 outline-none",
              "has-data-[state=checked]:bg-primary has-data-[state=checked]:text-primary-foreground has-data-[state=checked]:z-10",
              item.disabled ? "opacity-50 pointer-events-none" : "",
            ].join(" ")}
          >
            <div className="group flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RadioGroupItem
                  id={itemId}
                  value={item.value}
                  aria-label={`${ariaLabelPrefix}-${item.value}`}
                  aria-describedby={item.rightText ? rightId : undefined}
                  disabled={item.disabled}
                  className="text-primary bg-accent data-[state=checked]:bg-primary-foreground! data-[state=checked]:border-primary-foreground data-[state=checked]:[&_svg]:fill-primary after:absolute after:inset-0"
                />
                <Label className="inline-flex items-center gap-2" htmlFor={itemId}>
                  {item.label}
                  {item.badgeText ? (
                    <Badge
                      variant="outline"
                      className="rounded-sm border-green-500 bg-green-500/10 px-1.5 py-px text-xs text-green-500"
                    >
                      {item.badgeText}
                    </Badge>
                  ) : null}
                </Label>
              </div>

              {item.rightText ? (
                <div id={rightId} className="group-has-checked:text-primary-foreground text-xs leading-[inherit]">
                  {item.rightText}
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </RadioGroup>
  );
}

export default function StartQuizPage() {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  const quiz = useSelector((s: any) => s.quiz);
  const { user } = useSelector((s: any) => s.auth);

  const xpTotal = Number(user?.game?.xp ?? 0);
  const level = calcLevelFromXp(xpTotal);

  const limits = useMemo(() => getQuizLimitsByLevel(level), [level]);

  // Load latest quiz meta (same key as Home)
  const [lastQuiz, setLastQuiz] = useState<LastQuizMeta | null>(null);

  // Defaults
  const [category, setCategory] = useState<number>(0); // 0 = Any category
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [type, setType] = useState<QType>("multiple");
  const [amount, setAmount] = useState<number>(10);
  const [durationSec, setDurationSec] = useState<number>(120);

  const isLoading = quiz.status === "loading";

  const amountSafe = useMemo(
    () => clamp(amount || 10, limits.amountMin, limits.amountMax),
    [amount, limits.amountMin, limits.amountMax]
  );

  const durationSafe = useMemo(
    () => clamp(durationSec || 120, limits.timeMinSec, limits.timeMaxSec),
    [durationSec, limits.timeMinSec, limits.timeMaxSec]
  );

  // Read lastQuizMeta on mount and optionally prefill
  useEffect(() => {
    const raw = localStorage.getItem("lastQuizMeta");
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        setLastQuiz(parsed);

        // Prefill form from last played quiz (still clamped by level rules below)
        if (typeof parsed.amount === "number") setAmount(parsed.amount);
        if (typeof parsed.categoryId === "number") setCategory(parsed.categoryId);
        if (parsed.type === "multiple" || parsed.type === "boolean") setType(parsed.type);
        if (parsed.difficulty === "easy" || parsed.difficulty === "medium" || parsed.difficulty === "hard") {
          setDifficulty(parsed.difficulty);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Enforce level-based constraints whenever level/limits change
  useEffect(() => {
    if (!limits.allowedDifficulties.includes(difficulty)) {
      setDifficulty(limits.allowedDifficulties[0]);
    }
    setAmount((prev) => clamp(prev || 10, limits.amountMin, limits.amountMax));
    setDurationSec((prev) => clamp(prev || 120, limits.timeMinSec, limits.timeMaxSec));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    level,
    limits.amountMin,
    limits.amountMax,
    limits.timeMinSec,
    limits.timeMaxSec,
    limits.allowedDifficulties.join(","),
  ]);

  // Keep latest quiz meta synced when quiz is successfully loaded
  useEffect(() => {
    if (!quiz?.questions?.length) return;

    const q0 = quiz.questions[0];
    const catName = q0?.category ? String(q0.category) : undefined;

    // Map category name -> id using our list (best-effort)
    const catId = CATEGORIES.find((c) => c.name === catName)?.id;

    const qType: QType = (q0?.type as QType) === "boolean" ? "boolean" : "multiple";
    const qDiff: Difficulty = (q0?.difficulty as Difficulty) || "easy";

    const meta: LastQuizMeta = {
      title: catName ? `${catName}` : "Latest Quiz",
      difficulty: qDiff,
      categoryId: catId,
      categoryName: catName,
      amount: quiz.totalCount || quiz.questions.length,
      type: qType,
      playedAt: Date.now(),
    };

    localStorage.setItem("lastQuizMeta", JSON.stringify(meta));
    setLastQuiz(meta);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz?.questions?.length]);

  const start = async () => {
    const selectedCategory = category || undefined;
    const selectedCategoryName = selectedCategory ? CATEGORIES.find((c) => c.id === selectedCategory)?.name : undefined;

    // Write lastQuizMeta BEFORE fetching
    const meta: LastQuizMeta = {
      title: selectedCategoryName
        ? `${selectedCategoryName} (${titleCaseDifficulty(difficulty)})`
        : `All Categories (${titleCaseDifficulty(difficulty)})`,
      difficulty,
      categoryId: selectedCategory,
      categoryName: selectedCategoryName,
      amount: amountSafe,
      type,
      playedAt: Date.now(),
    };

    localStorage.setItem("lastQuizMeta", JSON.stringify(meta));
    setLastQuiz(meta);

    const action = await dispatch(
      fetchQuiz({
        amount: amountSafe,
        type,
        difficulty,
        category: selectedCategory,
      })
    );

    if (fetchQuiz.fulfilled.match(action) && action.payload?.length) {
      dispatch(startQuiz({ durationSec: durationSafe }));
      navigate("/quiz");
    } else {
      alert("Failed to load questions. Try different settings.");
    }
  };

  const startLatestQuiz = async () => {
    if (!lastQuiz) return;

    const safeDiff: Difficulty = limits.allowedDifficulties.includes(lastQuiz.difficulty)
      ? lastQuiz.difficulty
      : limits.allowedDifficulties[0];

    const safeAmount = clamp(lastQuiz.amount ?? 10, limits.amountMin, limits.amountMax);

    const action = await dispatch(
      fetchQuiz({
        amount: safeAmount,
        type: (lastQuiz.type ?? "multiple") as any,
        difficulty: safeDiff,
        category: lastQuiz.categoryId,
      })
    );

    if (fetchQuiz.fulfilled.match(action) && action.payload?.length) {
      dispatch(startQuiz({ durationSec: durationSafe }));
      navigate("/quiz");
    } else {
      alert("Failed to load questions. Try different settings.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Start a Quiz</h1>
        <p className="text-muted-foreground text-sm">
          Pick your settings and jump in. Your current level is{" "}
          <span className="text-foreground font-medium">Lv {level}</span>.
        </p>
      </div>

      {/* Latest Quiz (synced with Home via localStorage "lastQuizMeta") */}
      <Card>
        <CardHeader className="gap-0">
          <CardTitle className="text-base">Latest Quiz</CardTitle>
          <CardDescription className="sr-only">
            {lastQuiz
              ? `${lastQuiz.title} · ${titleCaseDifficulty(lastQuiz.difficulty)} · ${typeLabel(
                  lastQuiz.type ?? "multiple"
                )}`
              : "No recent quiz yet. Start one to see it here."}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex justify-between items-end gap-4">
          <div>
            {lastQuiz ? (
              <>
                <p className="leading-none font-semibold text-lg">{lastQuiz.title}</p>
                <p className="leading-none text-sm text-muted-foreground">
                  {`${titleCaseDifficulty(lastQuiz.difficulty)} · ${typeLabel(lastQuiz.type ?? "multiple")} · ${
                    lastQuiz.amount ?? 10
                  } question(s)`}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No recent quiz yet. Start one to see it here.</p>
            )}
          </div>

          <Button variant="outline" onClick={startLatestQuiz} disabled={!lastQuiz || isLoading}>
            {isLoading ? "Loading…" : "Start Latest"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quiz Settings</CardTitle>
          <CardDescription>
            Customize category, difficulty, type, number of questions, and timer. Some options are limited by your
            level.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={String(category)} onValueChange={(v) => setCategory(Number(v))} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Any category</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Difficulty (radio cards) */}
          <div className="space-y-2">
            <Label>Difficulty</Label>

            <RadioCardGroup<Difficulty>
              value={difficulty}
              onValueChange={setDifficulty}
              ariaLabelPrefix="difficulty"
              items={[
                {
                  value: "easy",
                  label: "Easy",
                  rightText: "Unlocked",
                  badgeText: level <= 10 ? "Recommended" : undefined,
                },
                {
                  value: "medium",
                  label: "Medium",
                  rightText: level <= 10 ? "Unlock at Lv 11" : "Unlocked",
                  disabled: !limits.allowedDifficulties.includes("medium"),
                  badgeText: level > 10 && level <= 29 ? "Recommended" : undefined,
                },
                {
                  value: "hard",
                  label: "Hard",
                  rightText: level <= 29 ? "Unlock at Lv 30" : "Unlocked",
                  disabled: !limits.allowedDifficulties.includes("hard"),
                  badgeText: level >= 30 ? "Challenge" : undefined,
                },
              ]}
            />
          </div>

          {/* Type (radio cards) */}
          <div className="space-y-2">
            <Label>Question Type</Label>

            <RadioCardGroup<QType>
              value={type}
              onValueChange={setType}
              ariaLabelPrefix="qtype"
              items={[
                { value: "multiple", label: "Multiple Choice", rightText: "4 options" },
                { value: "boolean", label: "True / False", rightText: "2 options" },
              ]}
            />
          </div>

          <Separator />

          {/* Amount */}
          <div className="grid gap-2">
            <Label htmlFor="amount">
              Number of Questions ({limits.amountMin}–{limits.amountMax}){" "}
              <span className="text-muted-foreground">(cap increases with level)</span>
            </Label>
            <Input
              id="amount"
              type="number"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              disabled={isLoading}
              min={limits.amountMin}
              max={limits.amountMax}
            />
          </div>

          {/* Timer */}
          <div className="grid gap-2">
            <Label htmlFor="timer">
              Time Limit (seconds) <span className="text-muted-foreground">(max increases with level)</span>
            </Label>
            <Input
              id="timer"
              type="number"
              inputMode="numeric"
              value={durationSec}
              onChange={(e) => setDurationSec(Number(e.target.value))}
              disabled={isLoading}
              min={limits.timeMinSec}
              max={limits.timeMaxSec}
            />
            <div className="text-xs text-muted-foreground">
              Allowed: {limits.timeMinSec}s–{limits.timeMaxSec}s · Current: {durationSafe}s or{" "}
              {Number((durationSafe / 60).toFixed(2))}m
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => navigate("/home")} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={start} disabled={isLoading}>
              {isLoading ? "Loading…" : "Start Quiz"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Optional: Resume banner */}
      {quiz.status === "in_progress" && quiz.questions?.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quiz in progress</CardTitle>
            <CardDescription>
              You have an unfinished quiz. You can resume it instead of starting a new one.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-end">
            <Button variant="outline" onClick={() => navigate("/quiz")}>
              Resume
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
