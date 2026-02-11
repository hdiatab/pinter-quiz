import * as React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

type Testimonial = {
  quote: string;
  name: string;
  title: string;
  avatarSrc: string;
  avatarAlt?: string;
};

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    quote: "Orionbo cut our editing time in half. The outputs are clean, consistent, and easy to fine-tune.",
    name: "Alex Morgan",
    title: "Frontend Developer at StartHub",
    avatarSrc: "https://github.com/hdiatab.png",
    avatarAlt: "Alex Morgan",
  },
  {
    quote: "Orionbo cut our editing time in half. The outputs are clean, consistent, and easy to fine-tune.",
    name: "Alex Morgan",
    title: "Frontend Developer at StartHub",
    avatarSrc: "https://github.com/hdiatab.png",
    avatarAlt: "Alex Morgan",
  },
  {
    quote: "Orionbo cut our editing time in half. The outputs are clean, consistent, and easy to fine-tune.",
    name: "Alex Morgan",
    title: "Frontend Developer at StartHub",
    avatarSrc: "https://github.com/hdiatab.png",
    avatarAlt: "Alex Morgan",
  },
];

type TestimonialCarouselProps = {
  testimonials?: Testimonial[];
  className?: string;
};

export function TestimonialCarousel({ testimonials = DEFAULT_TESTIMONIALS, className }: TestimonialCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  React.useEffect(() => {
    if (!api) return;

    const sync = () => {
      setSelectedIndex(api.selectedScrollSnap());
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };

    sync();
    api.on("select", sync);
    api.on("reInit", sync);

    return () => {
      api.off("select", sync);
      api.off("reInit", sync);
    };
  }, [api]);

  return (
    <section
      className={cn("py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8", className)}
      aria-labelledby="testimonial-carousel"
    >
      <div className="mx-auto flex max-w-4xl flex-col items-center">
        <Carousel
          setApi={setApi}
          opts={{ align: "start", loop: false }}
          className="relative mx-auto w-full"
          role="region"
          aria-roledescription="carousel"
        >
          {/* Desktop nav buttons (overlay) */}
          <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-10 hidden items-center justify-between md:flex">
            <div className="pointer-events-auto">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="relative left-[-1rem] top-1/2 h-10 w-10 -translate-y-1/2 rounded-full shadow-xs"
                onClick={() => api?.scrollPrev()}
                disabled={!canScrollPrev}
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Previous slide</span>
              </Button>
            </div>

            <div className="pointer-events-auto">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="relative right-[-1rem] top-1/2 h-10 w-10 -translate-y-1/2 rounded-full shadow-xs"
                onClick={() => api?.scrollNext()}
                disabled={!canScrollNext}
              >
                <ArrowRight className="h-4 w-4" />
                <span className="sr-only">Next slide</span>
              </Button>
            </div>
          </div>

          <CarouselContent className="-ml-4 px-2 sm:px-4">
            {testimonials.map((t, idx) => (
              <CarouselItem key={`${t.name}-${idx}`} className="basis-full pl-4 pt-4 md:pt-6">
                <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-2 md:gap-8 md:px-4">
                  <blockquote className="text-foreground text-center text-base/7 font-medium text-pretty sm:text-lg md:text-xl">
                    &quot;{t.quote}&quot;
                  </blockquote>

                  <div className="flex flex-col items-center gap-3 md:flex-row md:gap-4">
                    <Avatar className="h-10 w-10 rounded-xl md:h-12 md:w-12 lg:h-14 lg:w-14">
                      <AvatarImage src={t.avatarSrc} alt={t.avatarAlt ?? t.name} className="aspect-square size-full" />
                    </Avatar>

                    <div className="flex flex-col items-center gap-0.5 md:items-start">
                      <span className="text-foreground font-medium">{t.name}</span>
                      <span className="text-muted-foreground">{t.title}</span>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Mobile dots */}
        <div className="mt-8 flex justify-center gap-1.5 md:hidden">
          {testimonials.map((_, i) => {
            const active = i === selectedIndex;
            return (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => api?.scrollTo(i)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  active ? "w-4 bg-primary" : "w-2 bg-muted-foreground/20"
                )}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
