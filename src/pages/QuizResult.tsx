// src/pages/QuizResult.tsx
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { resetQuiz } from "@/store/quiz/quizSlice";

export default function ResultPage() {
  const dispatch = useDispatch();
  const quiz = useSelector((s: any) => s.quiz);

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
