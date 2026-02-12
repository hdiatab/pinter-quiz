import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
import PageTitle from "@/components/page-title";

type Difficulty = "easy" | "medium" | "hard";
type QuizType = "multiple" | "boolean";

type LastQuizMeta = {
  title: string;
  difficulty: Difficulty;
  categoryId?: number;
  categoryName?: string;
  amount?: number;
  type?: QuizType;
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

function quizTypeLabel(t: QuizType) {
  return t === "multiple" ? "Multiple Choice" : "True/False";
}

function quizTypeMetaLabel(t: QuizType) {
  return t === "multiple" ? "Multiple" : "True/False";
}

/** Human-friendly copy based on player level */
function heroCopyByLevel(level: number) {
  if (level <= 10) {
    return {
      title: "Warm-up round",
      subtitle: "Start simple, build momentum, and stack up XP.",
    };
  }
  if (level <= 29) {
    return {
      title: "Leveling up",
      subtitle: "Step into Medium for a bigger challenge, or stay in Easy to farm XP.",
    };
  }
  return {
    title: "Challenge mode",
    subtitle: "Hard is open. Push your limits or sharpen up in Medium/Easy.",
  };
}

function sectionHeading(diff: Difficulty, type: QuizType, level: number) {
  const diffLabel = sectionTitle(diff);
  const typeLabel = quizTypeLabel(type);

  // Make wording depend on difficulty first (so Easy never sounds like Hard)
  if (diff === "easy") {
    return type === "multiple" ? `${diffLabel} warm-ups — ${typeLabel}` : `${diffLabel} quick wins — ${typeLabel}`;
  }

  if (diff === "medium") {
    return type === "multiple" ? `${diffLabel} step-ups — ${typeLabel}` : `${diffLabel} rapid rounds — ${typeLabel}`;
  }

  // hard
  return type === "multiple"
    ? `${diffLabel} challenges — ${typeLabel}`
    : `${diffLabel} lightning rounds — ${typeLabel}`;
}

function sectionSubheading(diff: Difficulty, type: QuizType, level: number) {
  // If player is low level, keep everything encouraging and simple
  if (level <= 10) {
    if (diff === "easy") {
      return type === "multiple" ? "Simple questions to get you moving." : "Fast rounds to build confidence.";
    }
    // Medium/Hard won't show for <=10 anyway, but keep safe copy:
    return "A steady step up when you feel ready.";
  }

  // Mid level
  if (level <= 29) {
    if (diff === "easy") {
      return type === "multiple" ? "Great for relaxing and stacking XP." : "Quick rounds when you want easy progress.";
    }
    if (diff === "medium") {
      return type === "multiple"
        ? "A balanced challenge with solid rewards."
        : "Short, snappy rounds to keep momentum.";
    }
    return "For when you want to test yourself.";
  }

  // High level (30+): differentiate by diff so Easy doesn’t sound intense
  if (diff === "easy") {
    return type === "multiple"
      ? "Chill mode — perfect for warming up or farming XP."
      : "Light and fast — great between hard runs.";
  }
  if (diff === "medium") {
    return type === "multiple" ? "A strong mix of challenge and consistency." : "Quick decisions with a bit more bite.";
  }

  // hard
  return type === "multiple"
    ? "High-pressure questions, big rewards."
    : "Fast, intense, and addictive — trust your instincts.";
}

/**
 * Carousel wrapper with autoplay + per-instance delay.
 * useRef makes the plugin instance stable across renders.
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

function QuizCarousel({
  diff,
  type,
  delay,
  onStart,
}: {
  diff: Difficulty;
  type: QuizType;
  delay: number;
  onStart: (opts: { difficulty: Difficulty; type: QuizType; categoryId?: number; categoryName?: string }) => void;
}) {
  return (
    <AutoCarousel delay={delay}>
      <CarouselContent>
        {/* All categories */}
        <CarouselItem className="basis-[85%] sm:basis-[55%] lg:basis-[40%] cursor-grab active:cursor-grabbing select-none">
          <Card className="h-full justify-between relative overflow-hidden">
            <CardHeader className="pb-2">
              <Layers className="size-48 text-muted-foreground absolute opacity-30 -right-10 -bottom-4" />
              <CardTitle className="text-base">All Categories</CardTitle>
              <CardDescription>
                {titleCaseDifficulty(diff)} · {quizTypeMetaLabel(type)}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-start">
              <Button onClick={() => onStart({ difficulty: diff, type })} className="relative z-10">
                Start
              </Button>
            </CardContent>
          </Card>
        </CarouselItem>

        {/* Each category */}
        {CATEGORIES.map((c) => (
          <CarouselItem
            key={`${type}-${diff}-${c.id}`}
            className="basis-[85%] sm:basis-[55%] lg:basis-[40%] cursor-grab active:cursor-grabbing select-none"
          >
            <Card className="h-full justify-between relative overflow-hidden">
              <CardHeader className="pb-2">
                <CategoryIcon
                  id={c.id}
                  className="size-48 text-muted-foreground absolute opacity-30 -right-10 -bottom-4"
                />
                <CardTitle className="text-base">{c.name}</CardTitle>
                <CardDescription>
                  {titleCaseDifficulty(diff)} · {quizTypeMetaLabel(type)}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-start">
                <Button
                  onClick={() => onStart({ difficulty: diff, type, categoryId: c.id, categoryName: c.name })}
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
  );
}

function QuizCarouselSection({
  diff,
  type,
  delay,
  level,
  onStart,
}: {
  diff: Difficulty;
  type: QuizType;
  delay: number;
  level: number;
  onStart: (opts: { difficulty: Difficulty; type: QuizType; categoryId?: number; categoryName?: string }) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-medium">{sectionHeading(diff, type, level)}</h2>
        <p className="text-xs text-muted-foreground">{sectionSubheading(diff, type, level)}</p>
      </div>

      <QuizCarousel diff={diff} type={type} delay={delay} onStart={onStart} />
    </div>
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

  const hero = useMemo(() => heroCopyByLevel(level), [level]);

  // ✅ DIFFICULTY SECTIONS RULE:
  // <=10: [easy]
  // <=29: [medium, easy]
  // >=30: [hard, medium, easy]
  const difficultiesToShow: Difficulty[] = useMemo(() => {
    if (level <= 10) return ["easy"];
    if (level <= 29) return ["medium", "easy"];
    return ["hard", "medium", "easy"];
  }, [level]);

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

  // update last quiz meta when quiz questions exist
  useEffect(() => {
    if (!quiz?.questions?.length) return;

    const q0 = quiz.questions[0];
    const catName = q0?.category ? String(q0.category) : undefined;
    const catId = getCategoryIdFromName(catName);

    const qType: QuizType = (q0?.type as QuizType) === "boolean" ? "boolean" : "multiple";

    const meta: LastQuizMeta = {
      title: catName ? `${catName}` : "Latest Quiz",
      difficulty: (q0?.difficulty as Difficulty) || "easy",
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

  const startCategoryQuiz = (opts: {
    difficulty: Difficulty;
    type: QuizType;
    categoryId?: number;
    categoryName?: string;
  }) => {
    const meta: LastQuizMeta = {
      title: opts.categoryName
        ? `${opts.categoryName} (${titleCaseDifficulty(opts.difficulty)})`
        : `All Categories (${titleCaseDifficulty(opts.difficulty)})`,
      difficulty: opts.difficulty,
      categoryId: opts.categoryId,
      categoryName: opts.categoryName,
      amount: 10,
      type: opts.type,
      playedAt: Date.now(),
    };

    localStorage.setItem("lastQuizMeta", JSON.stringify(meta));
    setLastQuiz(meta);

    dispatch(resetQuiz());
    dispatch(
      fetchQuiz({
        amount: 10,
        type: opts.type,
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
    <div className="space-y-6">
      <PageTitle title="Home" />
      <div>
        <h1 className="text-2xl font-semibold">{hero.title}</h1>
        <p className="text-muted-foreground text-sm">
          {hasInProgress ? "You have a quiz in progress — resume it or start a new one." : hero.subtitle}
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

      {/* Difficulty sections: for each diff show Multiple then True/False */}
      <div className="space-y-10">
        {difficultiesToShow.map((diff) => (
          <div key={diff} className="space-y-8">
            <QuizCarouselSection
              diff={diff}
              type="multiple"
              delay={delayByDiff[diff]}
              level={level}
              onStart={startCategoryQuiz}
            />

            <QuizCarouselSection
              diff={diff}
              type="boolean"
              delay={delayByDiff[diff]}
              level={level}
              onStart={startCategoryQuiz}
            />
          </div>
        ))}
      </div>

      {/* Latest quiz */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Latest Quiz</h2>
        </div>

        <Card className="overflow-hidden relative">
          <CardHeader className="sr-only">
            <CardTitle className="text-base">{lastQuiz?.title ?? "No recent quiz yet"}</CardTitle>
            <CardDescription>
              {lastQuiz
                ? `${titleCaseDifficulty(lastQuiz.difficulty)} · ${quizTypeMetaLabel(
                    (lastQuiz.type ?? "multiple") as QuizType
                  )}`
                : "Start a quiz to see it here."}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex justify-between items-center flex-wrap">
            <div className="flex gap-4 items-center flex-wrap">
              <p className="leading-none font-semibold text-lg">{lastQuiz?.title ?? "No recent quiz yet"}</p>
              <p>•</p>
              <p className="text-sm text-muted-foreground">
                {lastQuiz
                  ? `${titleCaseDifficulty(lastQuiz.difficulty)} · ${quizTypeMetaLabel(
                      (lastQuiz.type ?? "multiple") as QuizType
                    )}`
                  : "Start a quiz to see it here."}
              </p>
            </div>

            <CategoryIcon
              id={lastQuiz?.categoryId || 9}
              className="size-48 text-muted-foreground opacity-30 absolute left-1/2 -top-12"
            />

            {lastQuiz ? (
              <Button onClick={startLatestQuiz}>Start</Button>
            ) : (
              <Button variant="secondary" onClick={() => startCategoryQuiz({ difficulty: "easy", type: "multiple" })}>
                Start
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
