import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
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
    title: "Getting started with Orionbo: a complete guide",
    date: "Dec 15, 2025",
    category: "Guides",
    href: "/blog/getting-started",
    imageSrc: image,
    imageAlt: "Getting started with Orionbo: a complete guide thumbnail",
  },
  {
    title: "Writing landing page copy that converts (with prompts)",
    date: "Dec 11, 2025",
    category: "Marketing",
    href: "/blog/landing-page-copy",
    imageSrc: image,
    imageAlt: "Writing landing page copy that converts (with prompts) thumbnail",
  },
  {
    title: "Brand voice playbook: how to stay consistent",
    date: "Nov 11, 2025",
    category: "Strategy",
    href: "/blog/brand-voice-playbook",
    imageSrc: image,
    imageAlt: "Brand voice playbook: how to stay consistent thumbnail",
  },
  {
    title: "Better emails in less time: 7 workflows to steal",
    date: "Nov 2, 2025",
    category: "Workflows",
    href: "/blog/better-emails-workflows",
    imageSrc: image,
    imageAlt: "Better emails in less time: 7 workflows to steal thumbnail",
  },
];

type BlogSectionProps = {
  posts?: BlogPost[];
  className?: string;
  onViewAll?: () => void;
  viewAllHref?: string;
};

export function BlogSection({ posts = DEFAULT_POSTS, className, onViewAll, viewAllHref = "/blog" }: BlogSectionProps) {
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
                Learn what&apos;s new
              </h2>

              <p className="text-pretty text-lg/8 text-muted-foreground">
                Tips, templates, and product updates to help you write faster and ship better copy.
              </p>
            </div>

            {onViewAll ? (
              <Button variant="outline" className="w-fit" onClick={onViewAll}>
                View all articles
              </Button>
            ) : (
              <Button asChild variant="outline" className="w-fit">
                <Link to={viewAllHref}>View all articles</Link>
              </Button>
            )}
          </div>

          {/* Right: cards */}
          <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2" role="list">
            {posts.map((post) => (
              <Link key={post.href} to={post.href} role="listitem" className="group block focus:outline-none">
                <Card className="overflow-hidden p-0 shadow-xs transition-colors hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
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
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
