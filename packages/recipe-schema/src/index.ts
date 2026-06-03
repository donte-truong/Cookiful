export type ImportedRecipeCsvRow = {
  title: string;
  ingredients: string;
  directions: string;
  link: string;
  source: string;
  NER: string;
  site: string;
};

export type RecipeBoxRawRecord = {
  title?: string | null;
  ingredients?: string[] | null;
  instructions?: string | string[] | null;
  picture_link?: string | null;
};

export type RecipeBoxRawDataset = Record<string, RecipeBoxRawRecord>;

export type ImportedRecipeRecord = {
  title: string;
  ingredients: string[];
  directions: string[];
  link: string;
  source: string;
  ner: string[];
  site: string;
};

export type ImportedRecipeBoxRecord = {
  recordId: string;
  title: string;
  ingredients: string[];
  directions: string[];
  pictureLink?: string;
  imageUrl?: string;
  imageReference?: string;
};

export type RecipeBoxImage = {
  url?: string;
  reference?: string;
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

export function cleanRecipeBoxIngredient(value: string): string {
  return value.replace(/\bADVERTISEMENT\b/gi, "").replace(/\s+/g, " ").trim();
}

export function normalizeRecipeBoxDirections(value: RecipeBoxRawRecord["instructions"]): string[] {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry).trim()).filter(Boolean);
  }

  if (typeof value !== "string") {
    return [];
  }

  return value
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function isFetchableRecipeBoxImageUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const hostname = url.hostname;
    const rawHostname = value.match(/^https?:\/\/([^/?#:]+)/)?.[1] ?? "";
    const labels = hostname.split(".");
    const topLevelDomain = labels[labels.length - 1] ?? "";

    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      rawHostname === rawHostname.toLowerCase() &&
      labels.length >= 2 &&
      /^[a-z0-9][a-z0-9.-]*[a-z0-9]$/.test(hostname) &&
      /^[a-z]{2,24}$/.test(topLevelDomain)
    );
  } catch {
    return false;
  }
}

export function normalizeRecipeBoxPictureLink(value: unknown): RecipeBoxImage {
  if (typeof value !== "string") {
    return {};
  }

  const pictureLink = value.trim();
  if (!pictureLink) {
    return {};
  }

  if (pictureLink.startsWith("http://") || pictureLink.startsWith("https://")) {
    return isFetchableRecipeBoxImageUrl(pictureLink)
      ? { url: pictureLink, reference: pictureLink }
      : { reference: pictureLink };
  }

  if (pictureLink.startsWith("//")) {
    const candidateUrl = `https:${pictureLink}`;
    return isFetchableRecipeBoxImageUrl(candidateUrl)
      ? { url: candidateUrl, reference: pictureLink }
      : { reference: pictureLink };
  }

  return { reference: pictureLink };
}

export function normalizeRecipeBoxRecord(
  recordId: string,
  row: RecipeBoxRawRecord
): ImportedRecipeBoxRecord | null {
  const title = String(row.title ?? "").trim();
  const ingredients = Array.isArray(row.ingredients)
    ? row.ingredients.map((entry) => cleanRecipeBoxIngredient(String(entry))).filter(Boolean)
    : [];
  const directions = normalizeRecipeBoxDirections(row.instructions);
  const image = normalizeRecipeBoxPictureLink(row.picture_link);

  if (!title || ingredients.length === 0 || directions.length === 0) {
    return null;
  }

  return {
    recordId,
    title,
    ingredients,
    directions,
    ...(image.reference ? { pictureLink: image.reference, imageReference: image.reference } : {}),
    ...(image.url ? { imageUrl: image.url } : {})
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
