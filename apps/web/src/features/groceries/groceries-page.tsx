"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState, useTransition } from "react";

import { BrandMark } from "../../components/brand/brand-mark";
import { HomeHeader } from "../home/components/home-header";
import { BookmarkIcon, PantryIcon, ShoppingBagIcon } from "../home/components/home-icons";
import { addPantryIngredient, removePantryIngredient } from "./actions";
import type { GroceriesData, PantryItem, RequiredIngredientGroup } from "./groceries-data";
import { fetchStoredGroceriesData, groupRequiredIngredientsByRecipe } from "./groceries-data";

type GroceriesPageProps = {
  groceries: GroceriesData;
};

function GroceryStat({
  Icon,
  label,
  value,
}: {
  Icon: typeof ShoppingBagIcon;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-[1.5rem] bg-hearth-paper px-5 py-5 shadow-hearth">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-hearth-outline">
          {label}
        </p>
        <span className="grid h-10 w-10 place-items-center rounded-full bg-hearth-low text-hearth-copper">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-5 font-display text-[2.45rem] leading-none text-hearth-text">
        {value}
      </p>
    </div>
  );
}

type PantryMutationHandler = (ingredientName: string) => void;
type PantryRemoveHandler = (pantryItemId: string) => void;

function PantryAddForm({
  onAddIngredient,
  pending,
}: {
  onAddIngredient: PantryMutationHandler;
  pending: boolean;
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const ingredientName = formData.get("ingredientName");

    if (typeof ingredientName === "string" && ingredientName.trim()) {
      onAddIngredient(ingredientName.trim());
      event.currentTarget.reset();
    }
  }

  return (
    <form
      className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"
      onSubmit={handleSubmit}
    >
      <input
        className="h-12 min-w-0 rounded-full border border-hearth-ghost/60 bg-hearth-surface px-5 text-sm font-semibold text-hearth-text outline-none transition placeholder:text-hearth-outline focus:border-hearth-copper"
        maxLength={160}
        name="ingredientName"
        placeholder="Add pantry ingredient"
        type="text"
      />
      <button
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-hearth-text px-5 text-sm font-bold text-white transition hover:bg-hearth-copper"
        disabled={pending}
        type="submit"
      >
        <PantryIcon className="h-4 w-4" />
        Add
      </button>
    </form>
  );
}

function PantryShelf({
  items,
  onAddIngredient,
  onRemoveIngredient,
  pending,
}: {
  items: PantryItem[];
  onAddIngredient: PantryMutationHandler;
  onRemoveIngredient: PantryRemoveHandler;
  pending: boolean;
}) {
  return (
    <aside className="lg:sticky lg:top-28 lg:self-start">
      <div className="rounded-[1.8rem] bg-hearth-paper p-5 shadow-hearth sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-hearth-outline">
              Already have
            </p>
            <h2 className="mt-2 font-display text-[2rem] leading-tight text-hearth-text">
              Pantry List
            </h2>
          </div>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-hearth-low text-hearth-copper">
            <PantryIcon className="h-5 w-5" />
          </span>
        </div>

        <PantryAddForm onAddIngredient={onAddIngredient} pending={pending} />

        {items.length > 0 ? (
          <div className="mt-6 flex flex-col gap-3">
            {items.map((item) => (
              <div
                className="flex min-h-14 items-center justify-between gap-3 rounded-[1rem] bg-hearth-surface px-4 py-3"
                key={item.id}
              >
                <span className="min-w-0 text-sm font-semibold leading-6 text-hearth-text">
                  {item.ingredientName}
                </span>
                <form
                  className="shrink-0"
                  onSubmit={(event) => {
                    event.preventDefault();
                    onRemoveIngredient(item.id);
                  }}
                >
                  <input name="pantryItemId" type="hidden" value={item.id} />
                  <button
                    aria-label={`Remove ${item.ingredientName}`}
                    className="rounded-full px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-hearth-outline transition hover:bg-hearth-low hover:text-hearth-copper"
                    disabled={pending}
                    type="submit"
                  >
                    Remove
                  </button>
                </form>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-[1.2rem] bg-hearth-low px-4 py-5">
            <p className="text-sm font-semibold leading-6 text-hearth-muted">
              Pantry items will appear here after you add ingredients you already have.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}

function IngredientRow({
  ingredient,
  onAddIngredient,
  pending,
}: {
  ingredient: RequiredIngredientGroup["ingredients"][number];
  onAddIngredient: PantryMutationHandler;
  pending: boolean;
}) {
  return (
    <li className="grid gap-3 rounded-[1rem] bg-hearth-surface px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="flex min-w-0 items-start gap-3">
        <span
          aria-hidden="true"
          className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs font-black ${
            ingredient.inPantry
              ? "border-hearth-copper bg-hearth-copper text-white"
              : "border-hearth-ghost bg-hearth-paper text-transparent"
          }`}
        >
          {ingredient.inPantry ? (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 16 16">
              <path
                d="M3.5 8.2 6.6 11.3 12.8 4.7"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          ) : null}
        </span>
        <div className="min-w-0">
          <p
            className={`text-sm font-semibold leading-6 text-hearth-text ${
              ingredient.inPantry ? "opacity-60 line-through" : ""
            }`}
          >
            {ingredient.text}
          </p>
        </div>
      </div>

      {ingredient.inPantry ? (
        <span className="inline-flex h-9 items-center justify-center rounded-full bg-hearth-low px-4 text-xs font-bold uppercase tracking-[0.16em] text-hearth-copper">
          In pantry
        </span>
      ) : (
        <form
          className="sm:justify-self-end"
          onSubmit={(event) => {
            event.preventDefault();
            onAddIngredient(ingredient.text);
          }}
        >
          <input name="ingredientName" type="hidden" value={ingredient.text} />
          <button
            className="inline-flex h-9 items-center justify-center rounded-full border border-hearth-ghost bg-hearth-paper px-4 text-xs font-bold uppercase tracking-[0.16em] text-hearth-copper transition hover:border-hearth-copper hover:bg-hearth-low"
            disabled={pending}
            type="submit"
          >
            Have it
          </button>
        </form>
      )}
    </li>
  );
}

function RecipeIngredientCard({
  group,
  onAddIngredient,
  pending,
}: {
  group: RequiredIngredientGroup;
  onAddIngredient: PantryMutationHandler;
  pending: boolean;
}) {
  const progress = group.totalCount > 0 ? Math.round((group.inPantryCount / group.totalCount) * 100) : 0;

  return (
    <article className="rounded-[1.8rem] bg-hearth-paper p-5 shadow-hearth sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-hearth-outline">
            Saved recipe
          </p>
          <h3 className="mt-2 font-display text-[1.65rem] leading-tight text-hearth-text">
            {group.recipeTitle}
          </h3>
        </div>
        <div className="shrink-0 rounded-full bg-hearth-low px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-hearth-copper">
          {group.missingCount} to shop
        </div>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-hearth-high">
        <div className="h-full rounded-full bg-copper-gradient" style={{ width: `${progress}%` }} />
      </div>

      <ul className="mt-5 grid gap-3">
        {group.ingredients.map((ingredient) => (
          <IngredientRow
            ingredient={ingredient}
            key={ingredient.id}
            onAddIngredient={onAddIngredient}
            pending={pending}
          />
        ))}
      </ul>
    </article>
  );
}

function EmptyGroceriesState() {
  return (
    <div className="rounded-[1.8rem] bg-hearth-paper px-6 py-12 shadow-hearth">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-hearth-low text-hearth-copper">
        <ShoppingBagIcon className="h-7 w-7" />
      </div>
      <p className="mt-6 font-display text-[1.8rem] text-hearth-text">
        No saved recipe ingredients yet
      </p>
      <p className="mt-3 max-w-[34rem] text-sm leading-7 text-hearth-muted">
        Saved recipes will gather here as a grocery list grouped by recipe.
      </p>
      <Link
        className="mt-6 inline-flex text-sm font-bold text-hearth-copper transition hover:text-hearth-copperSoft hover:underline"
        href="/home#curated-feed"
      >
        Browse curated recipes
      </Link>
    </div>
  );
}

export function GroceriesPage({ groceries }: GroceriesPageProps) {
  const [activeGroceries, setActiveGroceries] = useState(groceries);
  const [message, setMessage] = useState("");
  const [loadState, setLoadState] = useState<
    "loading" | "loaded" | "unauthenticated" | "error"
  >("loading");
  const [isPending, startTransition] = useTransition();
  const groups = groupRequiredIngredientsByRecipe(activeGroceries.requiredIngredients);
  const pantryCoveredCount = activeGroceries.requiredIngredients.filter((ingredient) => ingredient.inPantry).length;
  const missingCount = activeGroceries.requiredIngredients.length - pantryCoveredCount;

  async function refreshGroceries() {
    const loadedGroceries = await fetchStoredGroceriesData();

    if (loadedGroceries === null) {
      setLoadState("unauthenticated");
      return;
    }

    setActiveGroceries(loadedGroceries);
    setLoadState("loaded");
  }

  useEffect(() => {
    let isMounted = true;

    void fetchStoredGroceriesData()
      .then((loadedGroceries) => {
        if (!isMounted) {
          return;
        }

        if (loadedGroceries === null) {
          setLoadState("unauthenticated");
          return;
        }

        setActiveGroceries(loadedGroceries);
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

  function handleAddIngredient(ingredientName: string) {
    setMessage("");

    startTransition(() => {
      void addPantryIngredient(ingredientName).then(async (result) => {
        if (result.status === "success") {
          await refreshGroceries();
          return;
        }

        setMessage(result.message);
        setLoadState(result.status);
      });
    });
  }

  function handleRemoveIngredient(pantryItemId: string) {
    setMessage("");

    startTransition(() => {
      void removePantryIngredient(pantryItemId).then(async (result) => {
        if (result.status === "success") {
          await refreshGroceries();
          return;
        }

        setMessage(result.message);
        setLoadState(result.status);
      });
    });
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-hearth-surface text-hearth-text">
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[30rem] bg-hearth-glow blur-3xl" />
      <HomeHeader />

      <div className="mx-auto max-w-[1440px] px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <section className="grid gap-8 py-8 lg:grid-cols-[1fr_24rem] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-hearth-outline">
              Market list
            </p>
            <h1 className="mt-4 font-display text-5xl leading-[0.95] text-hearth-text sm:text-6xl lg:text-[6.4rem]">
              Groceries
            </h1>
            <p className="mt-5 max-w-[46rem] text-lg leading-8 text-hearth-muted">
              Saved recipes become a practical ingredient list, with pantry matches kept on
              your Cookiful profile.
            </p>
          </div>

          <div className="rounded-[2rem] bg-hearth-paper p-6 shadow-hearth">
            <div className="flex items-center gap-4">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-hearth-low">
                <BrandMark className="h-12 w-12" />
              </div>
              <div>
                <p className="font-display text-[1.35rem] text-hearth-text">
                  Profile pantry
                </p>
                <p className="mt-1 text-sm leading-6 text-hearth-muted">
                  {activeGroceries.pantryItems.length} saved pantry{" "}
                  {activeGroceries.pantryItems.length === 1 ? "item" : "items"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 py-8 md:grid-cols-3">
          <GroceryStat Icon={BookmarkIcon} label="Saved" value={activeGroceries.savedRecipeCount} />
          <GroceryStat Icon={ShoppingBagIcon} label="Needed" value={missingCount} />
          <GroceryStat Icon={PantryIcon} label="In Pantry" value={pantryCoveredCount} />
        </section>

        {loadState === "unauthenticated" ? (
          <div className="rounded-[1.5rem] bg-hearth-paper px-5 py-4 text-sm font-semibold text-hearth-muted shadow-hearth">
            <Link className="text-hearth-copper hover:underline" href="/login">
              Sign in
            </Link>{" "}
            to sync saved recipe ingredients and pantry items.
          </div>
        ) : null}

        {loadState === "error" || message ? (
          <div className="rounded-[1.5rem] bg-hearth-blush/55 px-5 py-4 text-sm font-semibold text-hearth-text shadow-hearth">
            {message || "Cookiful could not load your groceries right now."}
          </div>
        ) : null}

        <section className="grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div>
            <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-hearth-outline">
                  Required ingredients
                </p>
                <h2 className="mt-2 font-display text-4xl text-hearth-text lg:text-[2.8rem]">
                  Saved Recipe List
                </h2>
              </div>
              <p className="text-sm font-semibold text-hearth-copper">
                {activeGroceries.requiredIngredients.length}{" "}
                {activeGroceries.requiredIngredients.length === 1 ? "ingredient" : "ingredients"}
              </p>
            </div>

            {groups.length > 0 ? (
              <div className="grid gap-5">
                {groups.map((group) => (
                  <RecipeIngredientCard
                    group={group}
                    key={group.recipeId}
                    onAddIngredient={handleAddIngredient}
                    pending={isPending}
                  />
                ))}
              </div>
            ) : (
              <EmptyGroceriesState />
            )}
          </div>

          <PantryShelf
            items={activeGroceries.pantryItems}
            onAddIngredient={handleAddIngredient}
            onRemoveIngredient={handleRemoveIngredient}
            pending={isPending}
          />
        </section>
      </div>
    </main>
  );
}
