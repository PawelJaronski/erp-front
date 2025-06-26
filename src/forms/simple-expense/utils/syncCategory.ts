import { ExpenseFormShape } from "./validation";

export type FieldKey = keyof ExpenseFormShape;

/**
 * Bidirectional category ↔ category_group synchronisation.
 *
 * When the `category` field changes we auto-set `category_group` based on
 * static mapping. If the `category_group` field changes **after** a category
 * has already been chosen, we now allow the pair to become temporarily
 * "inconsistent" – we no longer clear the selected `category` automatically.
 *
 * Returns the *mutated copy* of the provided form object (does not mutate the
 * original).
 */
export function syncCategory(
  form: ExpenseFormShape,
  field: FieldKey,
  value: string,
  getGroupForCategory: (category: string) => string | undefined,
): ExpenseFormShape {
  const next = { ...form, [field]: value } as ExpenseFormShape;

  if (field === "category" && value) {
    const deducedGroup = getGroupForCategory(value);
    // Do NOT override `category_group` when the user intentionally selected "other" –
    // they may have entered a custom group name that must be preserved.
    if (deducedGroup && next.category_group !== "other") {
      next.category_group = deducedGroup;
    }
  }

  // NOTE: previously we cleared `category` when `category_group` changed and
  // became incompatible. Business feedback (2025-06-26) requires keeping the
  // selected category intact, so we intentionally **do nothing** here.

  return next;
}