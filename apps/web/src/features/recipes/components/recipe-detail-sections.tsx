import type { RecipeDetail } from "../recipe-detail-data";

type RecipeDetailSectionsProps = {
  recipe: RecipeDetail;
};

function RecipeSectionTitle({
  children,
  count,
}: {
  children: string;
  count?: number;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <h2 className="font-display text-2xl text-hearth-text">{children}</h2>
      {count !== undefined ? (
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-hearth-outline">
          {count}
        </span>
      ) : null}
    </div>
  );
}

function RecipeIngredientItem({
  ingredient,
}: {
  ingredient: string;
}) {
  return (
    <li className="flex gap-3 text-sm leading-7 text-hearth-muted">
      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-hearth-copper" />
      <span>{ingredient}</span>
    </li>
  );
}

function RecipeIngredientList({ ingredients }: { ingredients: string[] }) {
  return (
    <section className="rounded-[1.5rem] bg-hearth-paper p-6 shadow-hearth">
      <RecipeSectionTitle count={ingredients.length}>Ingredients</RecipeSectionTitle>
      <ul className="mt-6 space-y-4">
        {ingredients.map((ingredient, index) => (
          <RecipeIngredientItem
            ingredient={ingredient}
            key={`${ingredient}-${index}`}
          />
        ))}
      </ul>
    </section>
  );
}

function RecipeInstructionStep({
  index,
  instruction,
}: {
  index: number;
  instruction: string;
}) {
  return (
    <li className="grid gap-4 rounded-[1.5rem] bg-hearth-paper p-5 shadow-hearth sm:grid-cols-[3.5rem_minmax(0,1fr)]">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-hearth-container font-display text-xl text-hearth-copper">
        {index + 1}
      </span>
      <p className="text-base leading-8 text-hearth-muted">{instruction}</p>
    </li>
  );
}

function RecipeInstructionList({ instructions }: { instructions: string[] }) {
  return (
    <section>
      <div className="mb-6">
        <h2 className="font-display text-3xl text-hearth-text">Method</h2>
      </div>
      <ol className="space-y-4">
        {instructions.map((instruction, index) => (
          <RecipeInstructionStep
            index={index}
            instruction={instruction}
            key={`${instruction}-${index}`}
          />
        ))}
      </ol>
    </section>
  );
}

export function RecipeDetailSections({ recipe }: RecipeDetailSectionsProps) {
  return (
    <div className="mx-auto grid max-w-[1440px] gap-8 px-4 pb-20 pt-4 sm:px-6 lg:grid-cols-[minmax(18rem,0.42fr)_minmax(0,0.9fr)] lg:px-8">
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <RecipeIngredientList ingredients={recipe.ingredients} />
      </aside>
      <RecipeInstructionList instructions={recipe.instructions} />
    </div>
  );
}
