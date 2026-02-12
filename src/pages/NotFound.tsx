import { Link } from "react-router-dom";

type NotFoundSectionProps = {
  title?: string;
  description?: string;
  badgeText?: string;
  homeHref?: string;
};

export default function NotFoundSection({
  title = "Page not found",
  description = "Sorry, we couldn't find the page you're looking for. Please check the URL or navigate back home.",
  badgeText = "404 Section",
  homeHref = "/",
}: NotFoundSectionProps) {
  return (
    <section className="bg-background py-16 md:py-20" aria-labelledby="error-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative z-10 flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
          <div className="mx-auto flex max-w-xl flex-1 flex-col items-center gap-6 text-center lg:gap-8">
            <div className="flex flex-col items-center gap-4 text-center lg:gap-6">
              <div className="flex w-fit items-center justify-center gap-1 bg-transparent text-sm font-medium capitalize text-muted-foreground [&_svg]:size-3.5 [&_svg]:shrink-0">
                {badgeText}
              </div>

              <h1 id="error-title" className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
                {title}
              </h1>

              <p className="text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                {description}
              </p>
            </div>

            <Link
              to={homeHref}
              className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50"
            >
              Go to homepage
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
