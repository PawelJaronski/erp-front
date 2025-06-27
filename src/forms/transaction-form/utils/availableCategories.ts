// Utility to calculate which categories should be presented in the select list
// depending on current form fields.
import { categoriesData } from "./staticData";
import { ExpenseFormShape } from "./validation";

interface CategoryItem {
  value: string;
  group: string;
}

/**
 * Business rule – filter categories only when `fields.category` is still empty.
 */
export function computeAvailableCategories(fields: ExpenseFormShape): CategoryItem[] {
  const base = [...categoriesData, { value: "other", group: "other" }];

  if (!fields.category && fields.category_group && fields.category_group !== "other") {
    return [
      ...categoriesData.filter((c) => c.group === fields.category_group),
      { value: "other", group: fields.category_group },
    ];
  }

  return base;
} 