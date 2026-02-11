import image from "@/assets/cornered-stairs.svg";

type FeatureCard = {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt?: string;
};

const FEATURES: FeatureCard[] = [
  {
    title: "Draft in seconds",
    description: "Go from blank page to a solid first draft for emails, blogs, and landing pages.",
    imageSrc: image,
    imageAlt: "Draft in seconds",
  },
  {
    title: "Rewrite on command",
    description: "Shorten, expand, simplify, or change tone while keeping the meaning intact.",
    imageSrc: image,
    imageAlt: "Rewrite on command",
  },
  {
    title: "Stay on-brand",
    description: "Apply your voice guidelines so every output sounds like your team wrote it.",
    imageSrc: image,
    imageAlt: "Stay on-brand",
  },
];

export function WriteBetterSection() {
  return (
    <section className="bg-muted py-12 md:py-16 lg:py-20 pb-0">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 md:gap-12 px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="mx-auto flex max-w-xl flex-col items-center text-center gap-4 md:gap-6">
          <div className="flex w-fit items-center justify-center gap-1 bg-transparent text-sm font-medium text-muted-foreground capitalize [&_svg]:size-3.5 [&_svg]:shrink-0">
            Write better
          </div>

          <h2 className="text-4xl font-bold text-foreground">See your writing improve with every prompt</h2>

          <p className="text-muted-foreground text-lg/8 text-pretty">
            Create cleaner drafts, sharper headlines, and stronger CTAs without extra editing loops.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-6">
          {FEATURES.map((item) => (
            <div key={item.title} className="flex flex-col gap-6">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
                {/* overlay tint */}
                <div className="absolute inset-0 z-10 h-full w-full bg-primary mix-blend-color" />

                <img
                  src={item.imageSrc}
                  alt={item.imageAlt ?? item.title}
                  className="h-full w-full object-cover"
                  sizes="(min-width: 1024px) 33vw, 100vw"
                />
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="text-lg font-semibold leading-snug text-foreground">{item.title}</h3>
                <p className="text-muted-foreground text-pretty">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
