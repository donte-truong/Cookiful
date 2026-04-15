# Meal Planning and Grocery Rules

## Meal Planning Rules

- each meal plan belongs to one user
- entries are scheduled by `planned_date` and `meal_slot`
- entries should prefer a fixed `recipe_version_id`
- servings are stored per entry, not inferred at read time
- edits should trigger grocery regeneration asynchronously

## Grocery Generation Pipeline

1. Load meal plan entries in range
2. Resolve each entry to a concrete recipe version
3. Scale ingredients by planned servings
4. Normalize quantities and units when possible
5. Merge compatible grocery items
6. Apply pantry subtraction when enabled
7. Group by aisle or ingredient category
8. Store source references for traceability

## Edge Cases

- freeform ingredient names that do not map cleanly to canonical ingredients
- stale pantry quantities
- optional ingredients
- recipe version drift after planning
- lossy unit normalization for volume and weight conversions

## Product Expectations

- users can manually edit grocery items
- users can check off purchased items
- users can regenerate after plan changes
- users should be able to see which planned meals contributed to an item

