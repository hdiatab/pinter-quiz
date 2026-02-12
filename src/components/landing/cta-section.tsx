import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

type CtaSectionProps = {
  className?: string;
  title?: string;
  eyebrow?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
};

export function CtaSection({
  className,
  eyebrow = "Get Orionbo",
  title = "Start writing better and faster today",
  description = "Create better on-brand drafts, rewrites, and summaries in minutes.",
  ctaLabel = "Get started",
  ctaHref = "/signup",
  onCtaClick,
}: CtaSectionProps) {
  return (
    <section className={cn("bg-primary py-12 md:py-16 lg:py-20", className)} aria-labelledby="cta-heading">
      <div className="mx-auto container px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-8 md:gap-10">
          <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center md:gap-6">
            <div className="flex w-fit items-center justify-center gap-1 bg-transparent text-sm font-medium capitalize text-primary-foreground/80 [&_svg]:size-3.5 [&_svg]:shrink-0">
              {eyebrow}
            </div>

            <h2 id="cta-heading" className="text-4xl font-bold tracking-tight text-primary-foreground md:text-5xl">
              {title}
            </h2>

            <p className="text-pretty text-lg/8 text-primary-foreground/80">{description}</p>
          </div>

          {onCtaClick ? (
            <Button
              type="button"
              onClick={onCtaClick}
              className="h-9 bg-primary-foreground px-4 py-2 text-primary hover:bg-primary-foreground/80"
              aria-label="Get started with our service"
            >
              {ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              asChild
              className="h-9 bg-primary-foreground px-4 py-2 text-primary hover:bg-primary-foreground/80"
              aria-label="Get started with our service"
            >
              <Link to={ctaHref}>
                {ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
