import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { resetQuiz } from "@/store/quiz/quizSlice";
import { applyQuizResultToUser } from "@/lib/userGame";
import { useEffect } from "react";
import { toast } from "sonner";

export default function ResultPage() {
  const dispatch = useDispatch();
  const quiz = useSelector((s: any) => s.quiz);

  useEffect(() => {
    const userId = localStorage.getItem("loggedInUser") || sessionStorage.getItem("loggedInUser");
    if (!userId) return;

    const key = `quiz_result_applied_${quiz.startedAt}`;
    if (sessionStorage.getItem(key)) return;

    const finishedBeforeTimeout =
      quiz.startedAt && quiz.finishedAt && Math.floor((quiz.finishedAt - quiz.startedAt) / 1000) < quiz.durationSec;

    const res = applyQuizResultToUser({
      userId,
      totalQuestions: quiz.totalCount,
      answered: quiz.answeredCount,
      correct: quiz.correctCount,
      wrong: quiz.wrongCount,
      finishedBeforeTimeout: !!finishedBeforeTimeout,
    });

    if (res) {
      sessionStorage.setItem(key, "1");
      toast.success(`+${res.xpGain} XP earned!`);
    }
  }, [
    quiz.startedAt,
    quiz.finishedAt,
    quiz.durationSec,
    quiz.totalCount,
    quiz.answeredCount,
    quiz.correctCount,
    quiz.wrongCount,
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiz Result</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm">
          Answered: <span className="font-medium">{quiz.answeredCount}</span> / {quiz.totalCount}
        </div>
        <div className="text-sm">
          Correct: <span className="font-medium">{quiz.correctCount}</span>
        </div>
        <div className="text-sm">
          Wrong: <span className="font-medium">{quiz.wrongCount}</span>
        </div>

        <div className="flex gap-2 pt-2">
          <Button asChild onClick={() => dispatch(resetQuiz())}>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
          <Button variant="secondary" asChild onClick={() => dispatch(resetQuiz())}>
            <Link to="/quiz">Try Again</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
