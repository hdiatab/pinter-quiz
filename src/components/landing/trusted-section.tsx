const LOGOS: { name: string; src: string }[] = [
  {
    name: "Harvard University",
    src: "https://en.wikipedia.org/wiki/Special:FilePath/Harvard%20University%20logo.svg",
  },
  {
    name: "MIT",
    src: "https://en.wikipedia.org/wiki/Special:FilePath/MIT_Logo_and_Wordmark.svg",
  },
  {
    name: "Stanford University",
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Stanford_wordmark_%282012%29.svg",
  },
  {
    name: "University of Oxford",
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Uni_Oxford_logo.svg",
  },
  {
    name: "University of Cambridge",
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/University_of_Cambridge_logo.png",
  },
  {
    name: "ETH Zürich",
    src: "https://en.wikipedia.org/wiki/Special:FilePath/ETH%20Z%C3%BCrich%20Logo.svg",
  },
  {
    name: "Caltech",
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Caltech_Logo.svg",
  },
];

export function TrustedBy() {
  return (
    <section className="bg-background py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center gap-12 md:gap-16">
          <div className="flex max-w-xl flex-col items-center text-center gap-3">
            <div className="text-sm font-medium text-muted-foreground capitalize">
              Trusted by top universities worldwide
            </div>
          </div>

          <LogoMarquee>
            {LOGOS.map((l) => (
              <div
                key={l.name}
                aria-label={`${l.name} logo`}
                className="relative mr-12 flex flex-shrink-0 place-items-center justify-center"
              >
                <LogoMark name={l.name} src={l.src} />
              </div>
            ))}
          </LogoMarquee>
        </div>
      </div>
    </section>
  );
}

/**
 * Marquee wrapper: sesuai struktur HTML kamu:
 * - overflow hidden
 * - mask gradient kiri/kanan
 * - track yang "infinite scroll"
 */
function LogoMarquee({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,black_12.5%,black_87.5%,transparent_100%)]">
      <div className="animate-infinite-scroll flex w-max items-center">
        {/* set 1 */}
        {children}
        {/* set 2 (duplikasi biar looping halus) */}
        {children}
      </div>
    </div>
  );
}

// Logo (ambil dari Wikipedia/Wikimedia via Special:FilePath)
function LogoMark({ name, src }: { name: string; src: string }) {
  return (
    <div className="py-2 px-4 rounded-lg dark:bg-card-foreground dark:border">
      <img
        src={src}
        alt={`${name} logo`}
        className="h-8 w-full object-contain"
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
