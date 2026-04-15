import { FlameIcon } from "./landing-icons";

export function LandingHeroSection() {
  return (
    <section
      className="relative mx-auto grid w-full max-w-[1440px] gap-16 px-5 pb-20 pt-10 sm:px-8 sm:pb-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,38rem)] lg:items-center lg:px-16 lg:pt-16"
      id="top"
    >
      <div className="relative z-10 max-w-[37rem]">
        <p className="mb-5 text-[0.7rem] uppercase tracking-[0.32em] text-hearth-accent/75 sm:text-xs">
          Est. 2026 - The Sensory Sommelier
        </p>
        <h1 className="font-display text-[clamp(3.4rem,11vw,7rem)] leading-[0.92] tracking-[-0.05em] text-hearth-text">
          The Art of{" "}
          <span className="italic text-hearth-copper">Slow Cooking</span>
        </h1>
        <p className="mt-8 max-w-xl text-lg leading-8 text-hearth-muted sm:text-xl">
          Rediscover the rhythm of the kitchen. Heritage culinary wisdom meets
          copper-precision AI tools to elevate your daily ritual.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            className="inline-flex items-center justify-center rounded-2xl bg-copper-gradient px-8 py-4 text-center text-sm font-semibold text-white shadow-hearth transition duration-300 hover:-translate-y-0.5 hover:brightness-105 sm:text-base"
            href="#collections"
          >
            Explore the Collections
          </a>
          <a
            className="ghost-outline inline-flex items-center justify-center rounded-2xl bg-white/65 px-8 py-4 text-center text-sm font-semibold text-hearth-copper transition duration-300 hover:bg-white/90 sm:text-base"
            href="#sous-chef"
          >
            Meet the Sous-Chef
          </a>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-[38rem] pt-6 lg:pt-0">
        <div className="hero-frame-glow absolute -left-6 top-4 h-[82%] w-[72%] rounded-[3.2rem] lg:-left-10" />
        <div className="absolute inset-y-6 left-7 right-0 rounded-[3rem] bg-hearth-high/85" />
        <div className="absolute inset-x-5 bottom-0 top-9 rounded-[3rem] bg-[linear-gradient(135deg,rgba(239,231,217,0.95),rgba(251,243,228,0.68))] -rotate-[3deg]" />
        <div className="hearth-shadow relative aspect-[0.95] overflow-hidden rounded-[3rem]">
          <div className="hero-vignette absolute inset-0 z-10" />
          <img
            alt="Copper cookware glowing with warm light above a live stovetop."
            className="h-full w-full object-cover transition duration-700 hover:scale-[1.03]"
            loading="eager"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZlWkdidqvT5c9xWsEE71d75CGGmmPjmCX6s-6dehCuk1Jgj34pBNyQj7tXPESqFdCx5BVpA8nhpYc8oRcHjkqx7EbCn5awJeQOFRtqklhpE_sPepjaKvyuCe1yEIDOVJvn0YkXLmMB9hEgAw8jp7DL_9emmvX7senS0KZFzvJhbMU6e0efOT54gPVNRL_mJNVg6X_NJfI3BdSFWwOmt1AHRBuk0y6855ZIMCiKaEJQCRVDSlEO7O0VSjAAnrrcJFjY76nhWipyLAJ"
          />
        </div>

        <div className="hearth-tip-card absolute -bottom-8 left-4 max-w-[15.75rem] rounded-[1.4rem] p-5 sm:-left-6 sm:p-6">
          <div className="mb-3 flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-hearth-blush text-hearth-copper">
              <FlameIcon className="h-4 w-4" />
            </span>
            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-hearth-accent/80">
              Hearth Tip
            </span>
          </div>
          <p className="text-sm leading-6 text-hearth-muted">
            &quot;Always pre-heat your copper core for even browning.&quot;
          </p>
        </div>
      </div>
    </section>
  );
}
