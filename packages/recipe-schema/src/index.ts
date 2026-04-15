export type ImportedRecipeCsvRow = {
  title: string;
  ingredients: string;
  directions: string;
  link: string;
  source: string;
  NER: string;
  site: string;
};

export type ImportedRecipeRecord = {
  title: string;
  ingredients: string[];
  directions: string[];
  link: string;
  source: string;
  ner: string[];
  site: string;
};

export type RecipeIngredient = {
  ingredientText: string;
  nerName?: string;
  sortOrder: number;
};

export type RecipeStep = {
  stepNumber: number;
  instructionText: string;
  sortOrder: number;
};

export function parseJsonArrayField(value: string): string[] {
  const parsed = JSON.parse(value) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error("Expected a JSON array field in recipe CSV data.");
  }

  return parsed.map((entry) => String(entry));
}

export function normalizeImportedRecipe(row: ImportedRecipeCsvRow): ImportedRecipeRecord {
  return {
    title: row.title.trim(),
    ingredients: parseJsonArrayField(row.ingredients),
    directions: parseJsonArrayField(row.directions),
    link: row.link.trim(),
    source: row.source.trim(),
    ner: parseJsonArrayField(row.NER),
    site: row.site.trim()
  };
}

export function toRecipeIngredients(record: ImportedRecipeRecord): RecipeIngredient[] {
  return record.ingredients.map((ingredientText, index) => ({
    ingredientText,
    nerName: record.ner[index],
    sortOrder: index + 1
  }));
}

export function toRecipeSteps(record: ImportedRecipeRecord): RecipeStep[] {
  return record.directions.map((instructionText, index) => ({
    stepNumber: index + 1,
    instructionText,
    sortOrder: index + 1
  }));
}

