const LOGOS: { name: string }[] = [
  { name: "Buzzsnap" },
  { name: "Dashstar" },
  { name: "Editly" },
  { name: "Geoaura" },
  { name: "Nanodea" },
  { name: "Revahub" },
  { name: "Starlight" },
];

export function TrustedBy() {
  return (
    <section className="bg-background py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center gap-12 md:gap-16">
          <div className="flex max-w-xl flex-col items-center text-center gap-3">
            <div className="text-sm font-medium text-muted-foreground capitalize">Trusted by the best companies</div>
          </div>

          <LogoMarquee>
            {LOGOS.map((l) => (
              <div
                key={l.name}
                aria-label={`${l.name} logo`}
                className="relative mr-12 flex flex-shrink-0 place-items-center justify-center"
              >
                <LogoMark name={l.name} />
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

// Placeholder logo. Ganti ini dengan SVG asli (pakai currentColor biar ikut theme).
function LogoMark({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 text-foreground">
      <div className="size-9 rounded-md border bg-card" />
      <span className="text-sm font-medium">{name}</span>
    </div>
  );
}
