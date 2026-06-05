"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { updateRecipeSocialAction, type RecipeSocialAction } from "../../social/actions";
import type { HomeRecipe } from "../home-data";
import { BookmarkIcon, HeartIcon, RepostIcon } from "./home-icons";

type HomeRecipeCardProps = {
  recipe: HomeRecipe;
  initialSocialActions?: RecipeSocialActionState;
};

type RecipeSocialActionState = {
  liked: boolean;
  saved: boolean;
  reposted: boolean;
};

type RecipeSocialButton = {
  action: RecipeSocialAction;
  label: string;
  Icon: typeof HeartIcon;
};

const recipeSocialButtons: RecipeSocialButton[] = [
  {
    action: "like",
    label: "Like recipe",
    Icon: HeartIcon,
  },
  {
    action: "save",
    label: "Save recipe",
    Icon: BookmarkIcon,
  },
  {
    action: "repost",
    label: "Repost recipe",
    Icon: RepostIcon,
  },
];

const defaultSocialActions: RecipeSocialActionState = {
  liked: false,
  saved: false,
  reposted: false,
};

const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";

function isHttpUrl(value: string | null | undefined): value is string {
  return value?.startsWith("http://") === true || value?.startsWith("https://") === true;
}

function getActionValue(
  socialActions: RecipeSocialActionState,
  action: RecipeSocialAction,
): boolean {
  if (action === "like") {
    return socialActions.liked;
  }

  if (action === "save") {
    return socialActions.saved;
  }

  return socialActions.reposted;
}

function setActionValue(
  socialActions: RecipeSocialActionState,
  action: RecipeSocialAction,
  value: boolean,
): RecipeSocialActionState {
  if (action === "like") {
    return {
      ...socialActions,
      liked: value,
    };
  }

  if (action === "save") {
    return {
      ...socialActions,
      saved: value,
    };
  }

  return {
    ...socialActions,
    reposted: value,
  };
}

export function HomeRecipeCard({
  recipe,
  initialSocialActions = defaultSocialActions,
}: HomeRecipeCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const [isOpeningRecipe, setIsOpeningRecipe] = useState(false);
  const [isSocialActionPending, startSocialActionTransition] = useTransition();
  const [socialActionMessage, setSocialActionMessage] = useState("");
  const [activeSocialActions, setActiveSocialActions] = useState<RecipeSocialActionState>(
    initialSocialActions,
  );
  const imageSrc = !imageFailed && recipe.image ? recipe.image : undefined;
  const hasImage = imageSrc !== undefined;
  const recipeHref =
    isStaticExport && isHttpUrl(recipe.sourceUrl)
      ? recipe.sourceUrl
      : isStaticExport
        ? "/home#curated-feed"
        : `/recipes/${recipe.id}`;
  const isExternalRecipeHref = isHttpUrl(recipeHref);

  function handleOpenRecipe() {
    if (!isStaticExport) {
      setIsOpeningRecipe(true);
    }
  }

  function handleSocialAction(action: RecipeSocialAction) {
    const nextActive = !getActionValue(activeSocialActions, action);
    const previousActions = activeSocialActions;

    setSocialActionMessage("");
    setActiveSocialActions(setActionValue(activeSocialActions, action, nextActive));

    startSocialActionTransition(() => {
      void updateRecipeSocialAction({
        recipeId: recipe.id,
        action,
        active: nextActive,
      }).then((result) => {
        if (result.status === "success") {
          setActiveSocialActions(result.actions);
          return;
        }

        setActiveSocialActions(previousActions);
        setSocialActionMessage(result.message);
      });
    });
  }

  return (
    <article className="group relative overflow-hidden rounded-[1.8rem] bg-hearth-paper shadow-hearth transition duration-300 hover:-translate-y-1">
      <Link
        aria-label={`Open ${recipe.title}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-hearth-copper/60"
        href={recipeHref}
        onClick={handleOpenRecipe}
        rel={isExternalRecipeHref ? "noreferrer" : undefined}
        target={isExternalRecipeHref ? "_blank" : undefined}
      >
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

        <div className="px-6 pb-4 pt-6">
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
      </Link>

      <div className="flex items-center gap-2 px-5 pb-5">
        <div className="flex items-center gap-2">
          {recipeSocialButtons.map(({ action, label, Icon }) => {
            const isActive = getActionValue(activeSocialActions, action);

            return (
              <button
                aria-label={`${label}: ${recipe.title}`}
                aria-pressed={isActive}
                className={`recipe-social-button grid h-11 w-11 place-items-center rounded-full bg-hearth-low text-hearth-muted transition duration-300 hover:-translate-y-0.5 hover:bg-hearth-blush hover:text-hearth-copper focus:outline-none focus-visible:ring-2 focus-visible:ring-hearth-copper/50 ${
                  isActive ? "is-active text-hearth-copper" : ""
                }`}
                disabled={isSocialActionPending}
                key={action}
                onClick={() => {
                  handleSocialAction(action);
                }}
                type="button"
              >
                <Icon className="h-5 w-5" />
              </button>
            );
          })}
        </div>
        <p aria-live="polite" className="sr-only">
          {socialActionMessage}
        </p>
      </div>

      {isOpeningRecipe ? (
        <div
          aria-live="polite"
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-hearth-surface/82 px-8 text-center backdrop-blur-md"
        >
          <div className="recipe-card-fetch-loader grid h-20 w-20 place-items-center rounded-full bg-hearth-paper shadow-hearth">
            <span className="h-10 w-10 rounded-full border-2 border-hearth-ghost border-t-hearth-copper" />
          </div>
          <p className="font-display text-[1.35rem] italic tracking-[-0.03em] text-hearth-text">
            Warming the recipe...
          </p>
        </div>
      ) : null}
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
