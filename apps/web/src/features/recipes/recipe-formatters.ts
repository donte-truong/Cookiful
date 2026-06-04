export function formatRecipeDurationLabel(durationMinutes: number): string {
  return `${Math.max(1, durationMinutes)} MIN`;
}

export function formatRecipeSourceLabel(sourceName: string | null): string {
  return sourceName || "Cookiful Archive";
}
