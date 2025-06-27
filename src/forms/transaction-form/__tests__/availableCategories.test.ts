/// <reference types="jest" />

import { computeAvailableCategories } from "../utils/availableCategories";
import { ExpenseFormShape } from "../utils/validation";

// Minimal fields helper
const baseForm: ExpenseFormShape = {
  account: "a",
  category_group: "opex",
  category: "",
  gross_amount: "10,00",
  business_timestamp: "2025-01-01",
};

describe("computeAvailableCategories", () => {
  it("filters to chosen group when category is empty", () => {
    const list = computeAvailableCategories({ ...baseForm });
    const distinctGroups = new Set(list.map((c) => c.group));
    expect(distinctGroups.size).toBe(1);
    expect([...distinctGroups][0]).toBe("opex");
  });

  it("returns full list when category is already chosen", () => {
    const list = computeAvailableCategories({ ...baseForm, category: "ads" });
    // We expect at least one element from another group (e.g., "taxes")
    const hasOtherGroup = list.some((c) => c.group !== "opex");
    expect(hasOtherGroup).toBe(true);
  });
}); 