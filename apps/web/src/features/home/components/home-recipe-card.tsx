import type { HomeRecipe } from "../home-data";

type HomeRecipeCardProps = {
  recipe: HomeRecipe;
};

export function HomeRecipeCard({ recipe }: HomeRecipeCardProps) {
  return (
    <article className="group overflow-hidden rounded-[1.8rem] bg-hearth-paper shadow-hearth transition duration-300 hover:-translate-y-1">
      <div className="relative h-64 overflow-hidden">
        <img
          alt={recipe.alt}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          src={recipe.image}
        />
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
      </div>
    </article>
  );
}
