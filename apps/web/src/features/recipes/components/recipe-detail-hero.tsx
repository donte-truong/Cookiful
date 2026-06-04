import Link from "next/link";

import { BrandLogo } from "../../../components/brand/brand-logo";
import type { RecipeDetail } from "../recipe-detail-data";
import { formatRecipeSourceLabel } from "../recipe-formatters";

type RecipeDetailHeroProps = {
  recipe: RecipeDetail;
};

function RecipeDetailNav() {
  return (
    <nav className="flex items-center justify-between gap-5">
      <Link
        aria-label="Kitchen Lab"
        className="inline-flex items-center text-hearth-text"
        href="/home"
      >
        <BrandLogo className="h-9 w-auto sm:h-10" />
      </Link>
      <Link
        className="inline-flex items-center gap-2 rounded-full bg-hearth-paper px-4 py-2 text-sm font-bold text-hearth-copper shadow-hearth transition hover:text-hearth-copperSoft"
        href="/home#curated-feed"
      >
        <span aria-hidden="true" className="text-lg leading-none">
          {"<"}
        </span>
        <span>Back to Kitchen Lab</span>
      </Link>
    </nav>
  );
}

function RecipeDetailBadge({
  children,
  tone = "copper",
}: {
  children: string;
  tone?: "accent" | "copper";
}) {
  const toneClass =
    tone === "accent" ? "text-hearth-accent" : "text-hearth-copper";

  return (
    <span
      className={`rounded-full bg-hearth-paper px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] ${toneClass} shadow-hearth`}
    >
      {children}
    </span>
  );
}

function RecipeDetailMetadata({ recipe }: RecipeDetailHeroProps) {
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <RecipeDetailBadge>{recipe.duration}</RecipeDetailBadge>
      <RecipeDetailBadge tone="accent">
        {formatRecipeSourceLabel(recipe.sourceName)}
      </RecipeDetailBadge>
    </div>
  );
}

function RecipeDetailImage({ recipe }: RecipeDetailHeroProps) {
  return (
    <div className="overflow-hidden rounded-[1.8rem] bg-hearth-paper shadow-hearth">
      {recipe.image ? (
        <img
          alt={recipe.imageAlt}
          className="aspect-[4/3] w-full object-cover"
          src={recipe.image}
        />
      ) : (
        <div className="flex aspect-[4/3] items-end bg-[radial-gradient(circle_at_top,rgba(247,212,178,0.95),rgba(193,106,43,0.92)_55%,rgba(81,42,19,0.96))] p-8 text-hearth-paper">
          <p className="font-display text-3xl leading-tight">{recipe.title}</p>
        </div>
      )}
    </div>
  );
}

export function RecipeDetailHero({ recipe }: RecipeDetailHeroProps) {
  return (
    <header className="relative overflow-hidden bg-hearth-surface">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-hearth-glow blur-3xl" />
      <div className="relative mx-auto max-w-[1440px] px-4 pb-12 pt-5 sm:px-6 lg:px-8">
        <RecipeDetailNav />

        <div className="grid gap-8 pt-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(22rem,0.7fr)] lg:items-end">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-hearth-outline">
              {recipe.tag}
            </p>
            <h1 className="mt-5 font-display text-4xl leading-tight text-hearth-text sm:text-5xl lg:text-6xl">
              {recipe.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-hearth-muted sm:text-lg">
              {recipe.description}
            </p>
            <RecipeDetailMetadata recipe={recipe} />
          </div>

          <RecipeDetailImage recipe={recipe} />
        </div>
      </div>
    </header>
  );
}
