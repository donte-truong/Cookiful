"use client";

import { useState } from "react";

import type { HomeRecipe } from "../home-data";

type HomeRecipeCardProps = {
  recipe: HomeRecipe;
};

export function HomeRecipeCard({ recipe }: HomeRecipeCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageSrc = !imageFailed && recipe.image ? recipe.image : undefined;
  const hasImage = imageSrc !== undefined;

  return (
    <article className="group overflow-hidden rounded-[1.8rem] bg-hearth-paper shadow-hearth transition duration-300 hover:-translate-y-1">
      <div className="relative h-64 overflow-hidden">
        {hasImage ? (
          <img
            alt={recipe.alt}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            loading="lazy"
            onError={() => {
              setImageFailed(true);
            }}
            src={imageSrc}
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

export function HomeRecipeCardSkeleton() {
  return (
    <article
      aria-hidden="true"
      className="overflow-hidden rounded-[1.8rem] bg-hearth-paper shadow-hearth"
    >
      <div className="recipe-card-loading-plate relative h-64 overflow-hidden">
        <div className="absolute left-4 top-4 flex gap-2">
          <span className="h-6 w-20 rounded-full bg-hearth-surface/80" />
          <span className="h-6 w-24 rounded-full bg-hearth-surface/80" />
        </div>
        <div className="absolute inset-x-6 bottom-6">
          <div className="h-3 w-28 rounded-full bg-hearth-paper/55" />
          <div className="mt-3 h-9 max-w-[14rem] rounded-2xl bg-hearth-paper/65" />
        </div>
        <div className="recipe-card-loading-sheen absolute inset-y-0 -left-1/2 w-1/2" />
      </div>

      <div className="p-6">
        <div className="recipe-card-loading-line h-7 w-4/5 rounded-full" />
        <div className="mt-4 space-y-3">
          <div className="recipe-card-loading-line h-3 w-full rounded-full" />
          <div className="recipe-card-loading-line h-3 w-11/12 rounded-full" />
          <div className="recipe-card-loading-line h-3 w-2/3 rounded-full" />
        </div>
        <div className="mt-6 flex items-center gap-2">
          <span className="recipe-card-loading-dot h-2 w-2 rounded-full" />
          <span className="recipe-card-loading-dot h-2 w-2 rounded-full [animation-delay:180ms]" />
          <span className="recipe-card-loading-dot h-2 w-2 rounded-full [animation-delay:360ms]" />
        </div>
      </div>
    </article>
  );
}
