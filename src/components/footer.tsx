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
    title: "Company",
    ariaLabel: "Company links",
    links: [
      { label: "About Us", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Partners", href: "#" },
    ],
  },
  {
    title: "Resources",
    ariaLabel: "Resources links",
    links: [
      { label: "Guides", href: "#" },
      { label: "Tutorials", href: "#" },
      { label: "FAQ", href: "#" },
      { label: "Downloads", href: "#" },
    ],
  },
  {
    title: "Account",
    ariaLabel: "Account links",
    links: [
      { label: "Your Account", href: "#" },
      { label: "Settings", href: "#" },
      { label: "Accessibility", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
  {
    title: "Help & Feedback",
    ariaLabel: "Help & Feedback links",
    links: [
      { label: "Contact Support", href: "#" },
      { label: "Get In Touch", href: "#" },
      { label: "Help Articles", href: "#" },
      { label: "Feedback Form", href: "#" },
    ],
  },
  {
    title: "Social",
    ariaLabel: "Social links",
    links: [
      { label: "Facebook", href: "#" },
      { label: "Linkedin", href: "#" },
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
      toast("Thankyou for subscribe to our news");
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
      <div className="mx-auto flex container flex-col gap-12 px-6 lg:gap-16">
        {/* Newsletter */}
        <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
          <div className="flex flex-col gap-1 text-center lg:text-left">
            <h2 className="text-lg font-medium text-foreground">Subscribe to our newsletter</h2>
            <p className="text-muted-foreground">Get the latest news and updates from our team.</p>
          </div>

          <div className="w-full max-w-sm">
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <div className="flex flex-col gap-2 lg:flex-row">
                <label htmlFor="footer-email" className="sr-only">
                  Email
                </label>

                <Input
                  id="footer-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                  required
                />

                <Button type="submit" disabled={submitting}>
                  Subscribe
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-1 items-center gap-12 text-center lg:grid-cols-5 lg:items-start lg:gap-6 lg:text-left">
          {columns.map((col) => (
            <div key={col.title} className="flex flex-col gap-4">
              <h3 className="text-base font-medium text-foreground">{col.title}</h3>
              <nav className="flex flex-col gap-3" aria-label={col.ariaLabel}>
                {col.links.map((l) => (
                  <Link
                    key={l.label}
                    to={l.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>

        <Separator />

        {/* Bottom bar */}
        <div className="flex flex-col gap-12 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
          <p className="order-2 text-center text-muted-foreground lg:order-1 lg:text-left">
            <span>Copyright © {year}</span>{" "}
            <Link to={brandHref} className="hover:underline">
              {brandLabel}
            </Link>
            . All rights reserved.
          </p>

          <nav
            className="order-1 flex flex-col items-center gap-4 text-center lg:order-2 lg:flex-row lg:items-start lg:gap-8 lg:text-left"
            aria-label="Legal links"
          >
            <Link to="#" className="text-muted-foreground transition-colors hover:text-foreground">
              Privacy Policy
            </Link>
            <Link to="#" className="text-muted-foreground transition-colors hover:text-foreground">
              Terms of Service
            </Link>
            <Link to="#" className="text-muted-foreground transition-colors hover:text-foreground">
              Cookies Settings
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
