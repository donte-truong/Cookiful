"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { BrandMark } from "../../components/brand/brand-mark";
import { HomeHeader } from "../home/components/home-header";
import { BookmarkIcon, HeartIcon, RepostIcon } from "../home/components/home-icons";
import { HomeRecipeCard } from "../home/components/home-recipe-card";
import type { HomeRecipe } from "../home/home-data";
import { fetchStoredProfileData, type ProfileData } from "./profile-data";

type ProfilePageProps = {
  profile: ProfileData;
};

type ProfileRecipeSectionProps = {
  title: string;
  label: string;
  recipes: HomeRecipe[];
  emptyTitle: string;
  emptyCopy: string;
  activeAction: "like" | "save" | "repost";
};

const profileSections = [
  {
    key: "likedRecipes",
    title: "Liked Recipes",
    label: "Hearted at the table",
    emptyTitle: "No liked recipes yet",
    emptyCopy: "The recipes you like from the curated feed will appear here.",
    activeAction: "like" as const,
  },
  {
    key: "savedRecipes",
    title: "Saved Recipes",
    label: "Kept for later",
    emptyTitle: "No saved recipes yet",
    emptyCopy: "Saved recipes will collect here for your next kitchen session.",
    activeAction: "save" as const,
  },
  {
    key: "repostedRecipes",
    title: "Reposted Recipes",
    label: "Shared back to the hearth",
    emptyTitle: "No reposted recipes yet",
    emptyCopy: "Reposted recipes will show here when you pass inspiration along.",
    activeAction: "repost" as const,
  },
];

function ProfileStat({
  Icon,
  label,
  value,
}: {
  Icon: typeof HeartIcon;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-[1.6rem] bg-hearth-paper px-5 py-5 shadow-hearth">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-hearth-outline">
          {label}
        </p>
        <span className="grid h-10 w-10 place-items-center rounded-full bg-hearth-low text-hearth-copper">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-5 font-display text-[2.6rem] leading-none tracking-[-0.05em] text-hearth-text">
        {value}
      </p>
    </div>
  );
}

function ProfileRecipeSection({
  title,
  label,
  recipes,
  emptyTitle,
  emptyCopy,
  activeAction,
}: ProfileRecipeSectionProps) {
  return (
    <section className="py-10">
      <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-hearth-outline">
            {label}
          </p>
          <h2 className="mt-2 font-display text-[clamp(2rem,4vw,2.8rem)] tracking-[-0.04em] text-hearth-text">
            {title}
          </h2>
        </div>
        <p className="text-sm font-semibold text-hearth-copper">
          {recipes.length} {recipes.length === 1 ? "recipe" : "recipes"}
        </p>
      </div>

      {recipes.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {recipes.map((recipe) => (
            <HomeRecipeCard
              initialSocialActions={{
                liked: activeAction === "like",
                saved: activeAction === "save",
                reposted: activeAction === "repost",
              }}
              key={`${activeAction}-${recipe.id}`}
              recipe={recipe}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[1.8rem] bg-hearth-paper px-6 py-10 shadow-hearth">
          <p className="font-display text-[1.55rem] tracking-[-0.03em] text-hearth-text">
            {emptyTitle}
          </p>
          <p className="mt-3 max-w-[34rem] text-sm leading-7 text-hearth-muted">
            {emptyCopy}
          </p>
          <Link
            className="mt-6 inline-flex text-sm font-bold text-hearth-copper transition hover:text-hearth-copperSoft hover:underline"
            href="/home#curated-feed"
          >
            Browse curated recipes
          </Link>
        </div>
      )}
    </section>
  );
}

export function ProfilePage({ profile }: ProfilePageProps) {
  const [activeProfile, setActiveProfile] = useState(profile);
  const [loadState, setLoadState] = useState<
    "loading" | "loaded" | "unauthenticated" | "error"
  >("loading");
  const displayName = activeProfile.user.displayName || activeProfile.user.username;

  useEffect(() => {
    let isMounted = true;

    void fetchStoredProfileData()
      .then((loadedProfile) => {
        if (!isMounted) {
          return;
        }

        if (loadedProfile === null) {
          setLoadState("unauthenticated");
          return;
        }

        setActiveProfile(loadedProfile);
        setLoadState("loaded");
      })
      .catch(() => {
        if (isMounted) {
          setLoadState("error");
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden bg-hearth-surface text-hearth-text">
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[30rem] bg-hearth-glow blur-3xl" />
      <HomeHeader />

      <div className="mx-auto max-w-[1440px] px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <section className="grid gap-8 py-8 lg:grid-cols-[1fr_24rem] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-hearth-outline">
              Personal kitchen profile
            </p>
            <h1 className="mt-4 font-display text-[clamp(3rem,8vw,6.5rem)] leading-[0.92] tracking-[-0.06em] text-hearth-text">
              {displayName}
            </h1>
            <p className="mt-5 max-w-[44rem] text-lg leading-8 text-hearth-muted">
              @{activeProfile.user.username} keeps a table of recipes worth revisiting,
              saving, and sharing with the Cookiful hearth.
            </p>
          </div>

          <div className="rounded-[2rem] bg-hearth-paper p-6 shadow-hearth">
            <div className="flex items-center gap-4">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-hearth-low">
                <BrandMark className="h-12 w-12" />
              </div>
              <div>
                <p className="font-display text-[1.35rem] tracking-[-0.03em] text-hearth-text">
                  {displayName}
                </p>
                <p className="mt-1 text-sm text-hearth-muted">
                  {activeProfile.user.email || "Sign in to sync your profile"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {loadState === "unauthenticated" ? (
          <div className="rounded-[1.5rem] bg-hearth-paper px-5 py-4 text-sm font-semibold text-hearth-muted shadow-hearth">
            <Link className="text-hearth-copper hover:underline" href="/login">
              Sign in
            </Link>{" "}
            to view your liked, saved, and reposted recipes.
          </div>
        ) : null}

        {loadState === "error" ? (
          <div className="rounded-[1.5rem] bg-hearth-blush/55 px-5 py-4 text-sm font-semibold text-hearth-text shadow-hearth">
            Cookiful could not load your profile right now.
          </div>
        ) : null}

        <section className="grid gap-4 py-8 md:grid-cols-3">
          <ProfileStat Icon={HeartIcon} label="Liked" value={activeProfile.likedRecipes.length} />
          <ProfileStat Icon={BookmarkIcon} label="Saved" value={activeProfile.savedRecipes.length} />
          <ProfileStat Icon={RepostIcon} label="Reposted" value={activeProfile.repostedRecipes.length} />
        </section>

        {profileSections.map((section) => (
          <ProfileRecipeSection
            activeAction={section.activeAction}
            emptyCopy={section.emptyCopy}
            emptyTitle={section.emptyTitle}
            key={section.key}
            label={section.label}
            recipes={activeProfile[section.key as keyof Pick<ProfileData, "likedRecipes" | "savedRecipes" | "repostedRecipes">]}
            title={section.title}
          />
        ))}
      </div>
    </main>
  );
}
