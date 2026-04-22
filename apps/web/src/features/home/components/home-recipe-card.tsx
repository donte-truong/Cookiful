import type { HomeRecipe } from "../home-data";

type HomeRecipeCardProps = {
  recipe: HomeRecipe;
};

export function HomeRecipeCard({ recipe }: HomeRecipeCardProps) {
  return (
    <article className="group overflow-hidden rounded-[1.8rem] bg-hearth-paper shadow-hearth transition duration-300 hover:-translate-y-1 cursor-pointer">
      <div className="relative h-64 overflow-hidden">
        {recipe.image ? (
          <img
            alt={recipe.alt}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            src={recipe.image}
          />
        ) : (
          <div className="flex h-full w-full items-end bg-[radial-gradient(circle_at_top,rgba(247,212,178,0.95),rgba(193,106,43,0.92)_55%,rgba(81,42,19,0.96))] p-6 text-hearth-paper">
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-hearth-paper/80">
                Recipe archive
              </p>
              <p className="mt-3 max-w-[16rem] font-display text-[1.75rem] leading-tight tracking-[-0.04em]">
                {recipe.title}
              </p>
            </div>
          </div>
        )}
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-hearth-surface/90 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.24em] text-hearth-copper backdrop-blur-md">
            {recipe.duration}
          </span>
          <span className="rounded-full bg-hearth-surface/90 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.24em] text-hearth-accent backdrop-blur-md">
            {recipe.tag}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="font-display text-[1.5rem] leading-tight tracking-[-0.03em] text-hearth-text transition group-hover:text-hearth-copper">
          {recipe.title}
        </h3>
        <p className="mt-3 text-sm leading-7 text-hearth-muted">
          {recipe.description}
        </p>
        {recipe.sourceName ? (
          <p className="mt-4 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-hearth-outline">
            From {recipe.sourceName}
          </p>
        ) : null}
      </div>
    </article>
  );
}
