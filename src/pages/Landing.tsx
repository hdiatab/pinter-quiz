import { WriteBetterSection } from "@/components/landing/write-better-section";
import { TestimonialCarousel } from "@/components/landing/testimonial-section";
import { BlogSection } from "@/components/landing/blog-section";
import { Hero } from "@/components/landing/hero-section";
import { TrustedBy } from "@/components/landing/trusted-section";
import { CtaSection } from "@/components/landing/cta-section";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <TrustedBy />
      <WriteBetterSection />
      <TestimonialCarousel />
      <BlogSection />
      <CtaSection />
    </>
  );
}
