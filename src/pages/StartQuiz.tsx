import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { fetchQuiz, startQuiz } from "@/store/quiz/quizSlice";

type Difficulty = "easy" | "medium" | "hard";
type QType = "multiple" | "boolean";

const CATEGORIES = [
  { id: 0, name: "Any category" },
  { id: 9, name: "General Knowledge" },
  { id: 17, name: "Science & Nature" },
  { id: 18, name: "Computers" },
  { id: 19, name: "Mathematics" },
  { id: 23, name: "History" },
  { id: 22, name: "Geography" },
  { id: 12, name: "Music" },
] as const;

export default function StartQuizPage() {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const quiz = useSelector((s: any) => s.quiz);

  const [category, setCategory] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<"any" | Difficulty>("any");
  const [type, setType] = useState<QType>("multiple");
  const [amount, setAmount] = useState<number>(10);
  const [durationSec, setDurationSec] = useState<number>(120);

  const isLoading = quiz.status === "loading";

  // simple constraints
  const amountSafe = useMemo(() => Math.min(50, Math.max(1, amount || 10)), [amount]);
  const durationSafe = useMemo(() => Math.min(60 * 30, Math.max(30, durationSec || 120)), [durationSec]); // 30s..30m

  const start = async () => {
    const action = await dispatch(
      fetchQuiz({
        amount: amountSafe,
        type,
        difficulty: difficulty === "any" ? undefined : difficulty,
        category: category || undefined,
      })
    );

    if (fetchQuiz.fulfilled.match(action) && action.payload?.length) {
      dispatch(startQuiz({ durationSec: durationSafe }));
      navigate("/quiz");
    } else {
      // fallback ringan, kamu bisa ganti toast kalau mau
      alert("Failed to load questions. Try different settings.");
    }
  };

  // kalau quiz lagi jalan, bisa langsung resume (optional)
  useEffect(() => {
    if (quiz.status === "in_progress" && quiz.questions?.length) {
      // kamu bisa tampilkan banner “resume” instead of auto-navigate
    }
  }, [quiz.status, quiz.questions?.length]);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Start a Quiz</h1>
        <p className="text-muted-foreground text-sm">
          Choose your preferences before starting. Questions are fetched from OpenTDB.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quiz Settings</CardTitle>
          <CardDescription>Customize category, difficulty, question type, amount, and timer.</CardDescription>
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
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <Label>Difficulty</Label>
            <Select value={difficulty} onValueChange={(v) => setDifficulty(v as any)} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Any difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any difficulty</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>Question Type</Label>
            <RadioGroup value={type} onValueChange={(v) => setType(v as QType)} className="grid gap-2">
              <div className="flex items-center gap-2">
                <RadioGroupItem id="multiple" value="multiple" />
                <Label htmlFor="multiple">Multiple Choice</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem id="boolean" value="boolean" />
                <Label htmlFor="boolean">True / False</Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Amount */}
          <div className="grid gap-2">
            <Label htmlFor="amount">Number of Questions (1–50)</Label>
            <Input
              id="amount"
              type="number"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              disabled={isLoading}
              min={1}
              max={50}
            />
            <div className="text-xs text-muted-foreground">We will request {amountSafe} questions.</div>
          </div>

          {/* Timer */}
          <div className="grid gap-2">
            <Label htmlFor="timer">Time Limit (seconds)</Label>
            <Input
              id="timer"
              type="number"
              inputMode="numeric"
              value={durationSec}
              onChange={(e) => setDurationSec(Number(e.target.value))}
              disabled={isLoading}
              min={30}
              max={60 * 30}
            />
            <div className="text-xs text-muted-foreground">
              Minimum 30 seconds, maximum 30 minutes. Current: {durationSafe}s
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => navigate("/dashboard")} disabled={isLoading}>
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
