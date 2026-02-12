import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { toast } from "sonner";

type FooterLink = { label: string; href: string };
type FooterColumn = { title: string; ariaLabel: string; links: FooterLink[] };

const DEFAULT_COLUMNS: FooterColumn[] = [
  {
    title: "Product",
    ariaLabel: "Product links",
    links: [
      { label: "Play a Quiz", href: "/quiz" },
      { label: "Categories", href: "/categories" },
      { label: "Leaderboard", href: "/leaderboard" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "Resources",
    ariaLabel: "Resources links",
    links: [
      { label: "How it Works", href: "/how-it-works" },
      { label: "FAQ", href: "/faq" },
      { label: "Blog", href: "/blog" },
      { label: "OpenTDB Credits", href: "/credits" },
    ],
  },
  {
    title: "Account",
    ariaLabel: "Account links",
    links: [
      { label: "Sign in", href: "/signin" },
      { label: "Sign up", href: "/signup" },
      { label: "Settings", href: "/settings" },
      { label: "Accessibility", href: "/accessibility" },
    ],
  },
  {
    title: "Support",
    ariaLabel: "Support links",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Help Center", href: "/help" },
      { label: "Feedback", href: "/feedback" },
      { label: "Status", href: "/status" },
    ],
  },
  {
    title: "Social",
    ariaLabel: "Social links",
    links: [
      { label: "Facebook", href: "#" },
      { label: "LinkedIn", href: "#" },
      { label: "Instagram", href: "#" },
      { label: "X", href: "#" },
    ],
  },
];

type FooterProps = {
  className?: string;
  columns?: FooterColumn[];
  brandHref?: string;
  brandLabel?: string;
  year?: number;
  onSubscribe?: (email: string) => void | Promise<void>;
};

export default function SiteFooter({
  className,
  columns = DEFAULT_COLUMNS,
  brandHref = "/",
  brandLabel = "hdiatab",
  year = new Date().getFullYear(),
}: FooterProps) {
  const [email, setEmail] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSubmitting(true);
      toast("Thanks for subscribing!");
      setEmail("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <footer
      className={cn("bg-background py-12 md:py-16 lg:py-20 text-sm", className)}
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="mx-auto flex container flex-col gap-10 px-6 md:gap-12 lg:gap-16">
        {/* Newsletter */}
        <div className="flex flex-col items-stretch gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-1 text-center lg:text-left">
            <h2 className="text-lg font-medium text-foreground">Get quiz updates</h2>
            <p className="text-muted-foreground">New categories, feature updates, and occasional trivia tips.</p>
          </div>

          <div className="w-full lg:max-w-md">
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <label htmlFor="footer-email" className="sr-only">
                  Email
                </label>

                <Input
                  id="footer-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 flex-1"
                  required
                />

                <Button type="submit" disabled={submitting} className="h-10 sm:w-auto shadow-none">
                  Subscribe
                </Button>
              </div>

              <p className="text-center text-xs text-muted-foreground sm:text-left">No spam. Unsubscribe anytime.</p>
            </form>
          </div>
        </div>

        {/* Link columns (better mobile/tablet layout) */}
        <div
          className={cn(
            "grid gap-10 text-center",
            "grid-cols-2",
            "md:grid-cols-3 md:text-left",
            "lg:grid-cols-5 lg:gap-6"
          )}
        >
          {columns.map((col) => (
            <div key={col.title} className="flex flex-col gap-4">
              <h3 className="text-base font-medium text-foreground">{col.title}</h3>
              <nav className="flex flex-col gap-3" aria-label={col.ariaLabel}>
                {col.links.map((l) => (
                  <span
                    key={l.label}
                    className="text-muted-foreground transition-colors hover:text-foreground hover:underline cursor-pointer w-fit"
                  >
                    {l.label}
                  </span>
                ))}
              </nav>
            </div>
          ))}
        </div>

        <Separator />

        {/* Bottom bar (mobile-first, tablet-friendly) */}
        <div className="flex flex-col gap-6 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <p className="text-muted-foreground">
            <span>© {year}</span>{" "}
            <Link to={"https://github.com/hdiatab"} className="hover:underline">
              {brandLabel}
            </Link>
            . All rights reserved.
          </p>

          <nav
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 md:justify-end"
            aria-label="Legal links"
          >
            <p className="text-muted-foreground transition-colors hover:text-foreground hover:underline hover:cursor-pointer">
              Privacy
            </p>
            <p className="text-muted-foreground transition-colors hover:text-foreground hover:underline hover:cursor-pointer">
              Terms
            </p>
            <p className="text-muted-foreground transition-colors hover:text-foreground hover:underline hover:cursor-pointer">
              Cookie Settings
            </p>
          </nav>
        </div>
      </div>
    </footer>
  );
}
