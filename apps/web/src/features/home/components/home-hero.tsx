import { homeQuickActions } from "../home-data";
import { SearchAccentIcon } from "./home-icons";

export function HomeHeroSection() {
  return (
    <section
      className="flex flex-col items-center px-4 pb-16 pt-14 text-center sm:px-6 sm:pb-20 sm:pt-20 lg:px-8 lg:pb-24 lg:pt-24"
      id="kitchen-lab"
    >
      <div className="max-w-3xl">
        <h1 className="font-display text-[clamp(3rem,8vw,5.6rem)] leading-[0.96] tracking-[-0.06em] text-hearth-text">
          What would you like to cook today?
        </h1>
      </div>

      <div className="mt-10 w-full max-w-3xl">
        <div className="relative rounded-[1.35rem] bg-hearth-container/80 px-5 py-4 shadow-hearth">
          <input
            className="w-full border-0 bg-transparent pr-12 text-lg text-hearth-text placeholder:text-hearth-outline focus:outline-none focus:ring-0"
            placeholder="Search ingredients, moods, or techniques..."
            type="text"
          />
          <button
            aria-label="Explore kitchen ideas"
            className="absolute right-4 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-hearth-copper transition hover:bg-white/65"
            type="button"
          >
            <SearchAccentIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {homeQuickActions.map((action) => {
          const Icon = action.icon;

          return (
            <a
              key={action.label}
              className="inline-flex items-center gap-2 rounded-full bg-hearth-paper px-4 py-2.5 text-sm font-medium text-hearth-accent shadow-hearth transition duration-300 hover:-translate-y-0.5 hover:text-hearth-copper"
              href={action.href}
            >
              <Icon className="h-4 w-4" />
              <span>{action.label}</span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
