import { socialStories } from "../home-data";
import { HomeSocialCard } from "./home-social-card";

export function HomeSocialSection() {
  return (
    <section className="pb-20 sm:pb-24" id="social-hearth">
      <div className="relative overflow-hidden rounded-[2.25rem] bg-hearth-high px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-14">
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-hearth-copper/8 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 rounded-full bg-white/40 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-display text-[clamp(2.2rem,4vw,3.2rem)] tracking-[-0.05em] text-hearth-text">
              The Social Hearth
            </h2>
            <p className="mt-4 max-w-xl text-base leading-8 text-hearth-muted sm:text-lg">
              See what your culinary circle is perfecting. Personalized for
              your shared interest in fermented flavors.
            </p>
          </div>

          <a
            className="text-sm font-bold text-hearth-copper transition hover:text-hearth-copperSoft"
            href="#kitchen-lab"
          >
            View All Collections
          </a>
        </div>

        <div className="relative z-10 mt-10 grid gap-6 lg:grid-cols-3">
          {socialStories.map((story) => (
            <HomeSocialCard key={story.title} story={story} />
          ))}
        </div>
      </div>
    </section>
  );
}
