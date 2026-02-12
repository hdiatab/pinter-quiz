import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import image from "@/assets/cornered-stairs.svg";

type BlogPost = {
  title: string;
  date: string;
  category: string;
  href: string;
  imageSrc: string;
  imageAlt?: string;
};

const DEFAULT_POSTS: BlogPost[] = [
  {
    title: "Getting started: build your first quiz in minutes",
    date: "Dec 15, 2025",
    category: "Guides",
    href: "/blog/getting-started",
    imageSrc: image,
    imageAlt: "Getting started: build your first quiz in minutes thumbnail",
  },
  {
    title: "Category picks: the most fun OpenTDB topics to try",
    date: "Dec 11, 2025",
    category: "Tips",
    href: "/blog/category-picks",
    imageSrc: image,
    imageAlt: "Category picks: the most fun OpenTDB topics to try thumbnail",
  },
  {
    title: "Difficulty levels explained: easy, medium, hard (and when to use them)",
    date: "Nov 11, 2025",
    category: "How it works",
    href: "/blog/difficulty-levels",
    imageSrc: image,
    imageAlt: "Difficulty levels explained thumbnail",
  },
  {
    title: "Score better: 7 simple habits to improve your trivia game",
    date: "Nov 2, 2025",
    category: "Playbook",
    href: "/blog/score-better-habits",
    imageSrc: image,
    imageAlt: "Score better: 7 simple habits to improve your trivia game thumbnail",
  },
];

type BlogSectionProps = {
  posts?: BlogPost[];
  className?: string;
};

export function BlogSection({ posts = DEFAULT_POSTS, className }: BlogSectionProps) {
  return (
    <section className={cn("bg-muted py-12 md:py-16 lg:py-20", className)} aria-labelledby="blog-section-heading">
      <div className="mx-auto container px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Left: heading + CTA */}
          <div className="flex max-w-lg flex-col items-start gap-8">
            <div className="flex flex-col gap-4 md:gap-6">
              <div className="flex w-fit items-center justify-center gap-1 bg-transparent text-sm font-medium text-muted-foreground capitalize [&_svg]:size-3.5 [&_svg]:shrink-0">
                Our blog
              </div>

              <h2 id="blog-section-heading" className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                Learn, play, repeat
              </h2>

              <p className="text-pretty text-lg/8 text-muted-foreground">
                Quick tips, guides, and updates to help you get more out of every quiz.
              </p>
            </div>

            <Button variant="outline" className="w-fit cursor-pointer">
              View all articles
            </Button>
          </div>

          {/* Right: cards */}
          <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2" role="list">
            {posts.map((post) => (
              <Card
                key={post.href}
                className="overflow-hidden p-0 shadow-xs transition-colors hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <div className="absolute inset-0 z-10 h-full w-full bg-primary mix-blend-color" />
                  <img
                    src={post.imageSrc}
                    alt={post.imageAlt ?? post.title}
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                <CardContent className="flex flex-col justify-between gap-3 p-6">
                  <h3 className="font-semibold tracking-tight text-card-foreground">{post.title}</h3>

                  <div className="flex flex-wrap items-center gap-2 text-sm leading-none">
                    <span className="text-muted-foreground">{post.date}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">{post.category}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
