import { ArrowUpRight, Check } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

const FEATURES = ["Fresh questions from OpenTDB", "Pick your category & difficulty", "Instant score and results"];

export function Hero() {
  return (
    <section className="bg-background" aria-labelledby="hero-heading">
      <div className="mx-auto flex container flex-col items-stretch gap-0 px-6 lg:flex-row lg:gap-16">
        <div className="flex flex-1 flex-col gap-6 pt-16 pb-12 lg:justify-center lg:gap-8">
          <div className="flex flex-col">
            <button
              type="button"
              className="flex items-center justify-center gap-1.5 w-fit rounded-full border bg-card px-3 py-0 h-7 text-sm font-medium shadow-xs transition-colors hover:bg-accent [&_svg]:size-4 [&_svg]:shrink-0"
            >
              <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
              <span>New quizzes available today</span>
            </button>

            <h1 id="hero-heading" className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
              Play quick quizzes. Learn something new.
            </h1>

            <p className="mt-4 text-lg/8 text-muted-foreground text-pretty">
              A fun quiz app powered by OpenTDB. Choose a topic, set the difficulty, and test your knowledge in minutes.
            </p>

            <div className="mt-6 flex flex-col gap-2">
              {FEATURES.map((t) => (
                <div key={t} className="flex items-start gap-3">
                  <Check className="text-primary size-5" />
                  <span className="text-muted-foreground text-base leading-5 font-medium">{t}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Link to={"/home"}>
              <Button>Start a quiz</Button>
            </Link>
          </div>
        </div>

        {/* Hero image */}
        <div className="relative h-[calc(100vh-120px)] w-full flex-1 rounded-2xl overflow-hidden">
          <div className="bg-primary absolute inset-0 z-0 h-full w-full infinite-image" />
        </div>
      </div>
    </section>
  );
}
