import { ExpenseFormShape } from "./validation";

export type FieldKey = keyof ExpenseFormShape;

/**
 * Bidirectional category ↔ category_group synchronisation.
 *
 * When the `category` field changes we auto-set `category_group` based on
 * static mapping; when `category_group` changes we clear `category` if now
 * mismatched.
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
    if (deducedGroup) {
      next.category_group = deducedGroup;
    }
  }

  if (field === "category_group" && value && form.category) {
    const currentCategoryGroup = getGroupForCategory(form.category);
    if (currentCategoryGroup && currentCategoryGroup !== value) {
      next.category = "";
    }
  }

  return next;
} 