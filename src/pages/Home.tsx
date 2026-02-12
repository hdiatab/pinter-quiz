import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

import Autoplay from "embla-carousel-autoplay";

import { calcLevelFromXp } from "@/lib/userGame";
import { fetchQuiz, resetQuiz } from "@/store/quiz/quizSlice";
import {
  BookOpen,
  Car,
  Cpu,
  Dices,
  Film,
  Gamepad2,
  Globe,
  Landmark,
  Laugh,
  Layers,
  Leaf,
  MessagesSquare,
  Monitor,
  Music,
  Palette,
  PawPrint,
  Scale,
  Sigma,
  Sparkles,
  Star,
  Theater,
  Trophy,
  Tv,
  type LucideIcon,
} from "lucide-react";

type Difficulty = "easy" | "medium" | "hard";

type LastQuizMeta = {
  title: string;
  difficulty: Difficulty;
  categoryId?: number;
  categoryName?: string;
  amount?: number;
  type?: "multiple" | "boolean";
  playedAt: number;
};

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

const CATEGORY_ICONS: Record<number, LucideIcon> = {
  9: Layers,
  10: BookOpen,
  11: Film,
  12: Music,
  13: Theater,
  14: Tv,
  15: Gamepad2,
  16: Dices,
  17: Leaf,
  18: Monitor,
  19: Sigma,
  20: Sparkles,
  21: Trophy,
  22: Globe,
  23: Landmark,
  24: Scale,
  25: Palette,
  26: Star,
  27: PawPrint,
  28: Car,
  29: MessagesSquare,
  30: Cpu,
  31: Laugh,
  32: Laugh,
};

function CategoryIcon({ id, className }: { id: number; className?: string }) {
  const Icon = CATEGORY_ICONS[id] ?? Layers;
  return <Icon className={className ?? "size-4 text-muted-foreground"} />;
}

const CATEGORY_NAME_TO_ID = new Map(CATEGORIES.map((c) => [c.name, c.id]));

function getCategoryIdFromName(name?: string) {
  if (!name) return undefined;
  return CATEGORY_NAME_TO_ID.get(name);
}

function titleCaseDifficulty(d: Difficulty) {
  return d.charAt(0).toUpperCase() + d.slice(1);
}

function sectionTitle(d: Difficulty) {
  return d === "easy" ? "Easy" : d === "medium" ? "Medium" : "Hard";
}

function sectionDesc(d: Difficulty) {
  return d === "easy"
    ? "All categories with easy questions."
    : d === "medium"
    ? "All categories with medium difficulty."
    : "All categories with hard questions.";
}

/**
 * Carousel dengan autoplay + delay yang bisa beda per instance.
 * NOTE: useRef dipakai supaya plugin instance stabil dan tidak ke-reset setiap render.
 */
function AutoCarousel({
  delay,
  children,
  className,
}: {
  delay: number;
  children: React.ReactNode;
  className?: string;
}) {
  const autoplay = useRef(
    Autoplay({
      delay,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    })
  );

  return (
    <Carousel opts={{ align: "start", loop: true }} plugins={[autoplay.current]} className={className}>
      {children}
    </Carousel>
  );
}

export default function HomePage() {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  const quiz = useSelector((s: any) => s.quiz);
  const { user } = useSelector((s: any) => s.auth);

  const hasInProgress = quiz?.status === "in_progress" && quiz?.questions?.length > 0;

  const xpTotal = Number(user?.game?.xp ?? 0);
  const level = calcLevelFromXp(xpTotal);

  // ✅ DIFFICULTY SECTIONS RULE:
  // <=10: [easy]
  // <=20: [medium, easy]
  // 21-29: [medium, easy] (biar progression halus)
  // >=30: [hard, medium, easy]
  const difficultiesToShow: Difficulty[] = useMemo(() => {
    if (level <= 10) return ["easy"];
    if (level <= 29) return ["medium", "easy"];
    return ["hard", "medium", "easy"];
  }, [level]);

  // delay beda per section (ms)
  const delayByDiff: Record<Difficulty, number> = useMemo(
    () => ({
      easy: 7500,
      medium: 6500,
      hard: 5800,
    }),
    []
  );

  const [lastQuiz, setLastQuiz] = useState<LastQuizMeta | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("lastQuizMeta");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") setLastQuiz(parsed);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!quiz?.questions?.length) return;

    const q0 = quiz.questions[0];
    const catName = q0?.category ? String(q0.category) : undefined;
    const catId = getCategoryIdFromName(catName);

    const meta: LastQuizMeta = {
      title: catName ? `${catName}` : "Latest Quiz",
      difficulty: (q0?.difficulty as Difficulty) || "easy",
      categoryId: catId,
      categoryName: catName,
      amount: quiz.totalCount || quiz.questions.length,
      type: "multiple",
      playedAt: Date.now(),
    };

    localStorage.setItem("lastQuizMeta", JSON.stringify(meta));
    setLastQuiz(meta);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz?.questions?.length]);

  const startCategoryQuiz = (opts: { difficulty: Difficulty; categoryId?: number; categoryName?: string }) => {
    const meta: LastQuizMeta = {
      title: opts.categoryName
        ? `${opts.categoryName} (${titleCaseDifficulty(opts.difficulty)})`
        : `All Categories (${titleCaseDifficulty(opts.difficulty)})`,
      difficulty: opts.difficulty,
      categoryId: opts.categoryId,
      categoryName: opts.categoryName,
      amount: 10,
      type: "multiple",
      playedAt: Date.now(),
    };

    localStorage.setItem("lastQuizMeta", JSON.stringify(meta));
    setLastQuiz(meta);

    dispatch(resetQuiz());
    dispatch(
      fetchQuiz({
        amount: 10,
        type: "multiple",
        difficulty: opts.difficulty,
        category: opts.categoryId,
      })
    );
    navigate("/quiz");
  };

  const startLatestQuiz = () => {
    const diff = lastQuiz?.difficulty ?? "easy";
    const catId = lastQuiz?.categoryId;

    dispatch(resetQuiz());
    dispatch(
      fetchQuiz({
        amount: lastQuiz?.amount ?? 10,
        type: (lastQuiz?.type ?? "multiple") as any,
        difficulty: diff,
        category: catId,
      })
    );
    navigate("/quiz");
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold">Home</h1>
        <p className="text-muted-foreground text-sm">
          {hasInProgress ? "Continue your quiz or start a new one." : "Start a new quiz."}
        </p>
      </div>

      {/* Continue (ONLY if in progress) */}
      {hasInProgress && (
        <Card>
          <CardHeader>
            <CardTitle>Continue</CardTitle>
            <CardDescription>{`Progress: ${quiz.answeredCount}/${quiz.totalCount} answered`}</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              Total questions: <span className="text-foreground font-medium">{quiz.totalCount}</span> · Answered:{" "}
              <span className="text-foreground font-medium">{quiz.answeredCount}</span>
            </div>
            <Button asChild>
              <Link to="/quiz">Resume</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ✅ Multiple difficulty sections (ordered hardest first) */}
      <div className="space-y-6">
        {difficultiesToShow.map((diff) => (
          <div key={diff} className="space-y-3">
            <div>
              <h2 className="text-sm font-medium">{`Recommended for you (${sectionTitle(diff)})`}</h2>
              <p className="text-xs text-muted-foreground">{sectionDesc(diff)}</p>
            </div>

            <AutoCarousel delay={delayByDiff[diff]} className="w-full">
              <CarouselContent>
                {/* All categories card */}
                <CarouselItem className="basis-[85%] sm:basis-[55%] lg:basis-[40%] cursor-grab active:cursor-grabbing select-none">
                  <Card className="h-full justify-between relative overflow-hidden">
                    <CardHeader className="pb-2">
                      <Layers className="size-48 text-muted-foreground absolute opacity-30 -right-10 -bottom-4" />
                      <CardTitle className="text-base">All Categories</CardTitle>
                      <CardDescription>{titleCaseDifficulty(diff)}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-start">
                      <Button onClick={() => startCategoryQuiz({ difficulty: diff })} className="relative z-10">
                        Start
                      </Button>
                    </CardContent>
                  </Card>
                </CarouselItem>

                {CATEGORIES.map((c) => (
                  <CarouselItem
                    key={`${diff}-${c.id}`}
                    className="basis-[85%] sm:basis-[55%] lg:basis-[40%] cursor-grab active:cursor-grabbing select-none"
                  >
                    <Card className="h-full justify-between relative overflow-hidden">
                      <CardHeader className="pb-2">
                        <CategoryIcon
                          id={c.id}
                          className="size-48 text-muted-foreground absolute opacity-30 -right-10 -bottom-4"
                        />
                        <CardTitle className="text-base">{c.name}</CardTitle>
                        <CardDescription>{titleCaseDifficulty(diff)}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex justify-start">
                        <Button
                          onClick={() =>
                            startCategoryQuiz({ difficulty: diff, categoryId: c.id, categoryName: c.name })
                          }
                          className="relative z-10"
                        >
                          Start
                        </Button>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>

              <div className="absolute flex flex-row-reverse justify-between gap-4 w-full bottom-0 translate-y-1/2">
                <CarouselNext className="relative translate-none right-0 top-0" />
                <CarouselPrevious className="relative translate-none left-0 top-0" />
              </div>
            </AutoCarousel>
          </div>
        ))}
      </div>

      <Separator />

      {/* Latest quiz (from last played) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Latest Quiz</h2>
        </div>

        <Card className="overflow-hidden relative">
          <CardHeader className="sr-only">
            <CardTitle className="text-base">{lastQuiz?.title ?? "No recent quiz yet"}</CardTitle>
            <CardDescription>
              {lastQuiz ? `${titleCaseDifficulty(lastQuiz.difficulty)}` : "Start a quiz to see it here."}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex justify-between items-center flex-wrap">
            <div className="flex gap-4 items-center flex-wrap">
              <p className="leading-none font-semibold text-lg">{lastQuiz?.title ?? "No recent quiz yet"}</p>
              <p>•</p>
              <p className="text-sm text-muted-foreground">
                {lastQuiz ? `${titleCaseDifficulty(lastQuiz.difficulty)}` : "Start a quiz to see it here."}
              </p>
            </div>

            <CategoryIcon
              id={lastQuiz?.categoryId || 9}
              className="size-48 text-muted-foreground opacity-30 absolute left-1/2 -top-12"
            />

            {lastQuiz ? (
              <Button onClick={startLatestQuiz}>Start</Button>
            ) : (
              <Button variant="secondary" onClick={() => startCategoryQuiz({ difficulty: "easy" })}>
                Start
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
