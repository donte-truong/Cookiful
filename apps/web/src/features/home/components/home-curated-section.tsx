import { curatedRecipes } from "../home-data";
import { ChevronDownIcon } from "./home-icons";
import { HomeEditorialCard } from "./home-editorial-card";
import { HomeRecipeCard } from "./home-recipe-card";

export function HomeCuratedSection() {
  return (
    <section className="pb-20 pt-4 sm:pb-24" id="curated-feed">
      <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-8">
          <div className="mb-7">
            <h2 className="font-display text-[clamp(2rem,4vw,2.8rem)] tracking-[-0.04em] text-hearth-text">
              Curated for your palate
            </h2>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.28em] text-hearth-outline">
              Based on your recent French technique study
            </p>
          </div>

          <div className="lg:max-h-[52rem] lg:overflow-y-auto lg:pr-4 lg:[&::-webkit-scrollbar-thumb]:rounded-full lg:[&::-webkit-scrollbar-thumb]:bg-hearth-copper/25 lg:[&::-webkit-scrollbar-track]:bg-hearth-container lg:[&::-webkit-scrollbar]:w-1.5">
            <div className="grid gap-6 md:grid-cols-2">
              {curatedRecipes.map((recipe) => (
                <HomeRecipeCard key={recipe.title} recipe={recipe} />
              ))}
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              className="group inline-flex items-center gap-2 text-sm font-bold text-hearth-copper transition hover:gap-3 hover:text-hearth-copperSoft"
              type="button"
            >
              <span>Load more inspiration</span>
              <ChevronDownIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="lg:col-span-4 lg:sticky lg:top-28">
          <HomeEditorialCard />
        </div>
      </div>
    </section>
  );
}
