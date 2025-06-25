/// <reference types="jest" />

import { syncCategory } from "../utils/syncCategory";
import { ExpenseFormShape } from "../utils/validation";

describe("syncCategory", () => {
  const getGroup = (cat: string) => {
    const map: Record<string, string> = {
      ads: "opex",
      vat: "taxes",
    };
    return map[cat];
  };

  it("sets category_group when category changes", () => {
    const form: ExpenseFormShape = {
      account: "a",
      category_group: "",
      category: "",
      gross_amount: "10,00",
      business_timestamp: "2025-01-01",
    };
    const next = syncCategory(form, "category", "ads", getGroup);
    expect(next.category_group).toBe("opex");
  });

  it("clears category when category_group becomes incompatible", () => {
    const form: ExpenseFormShape = {
      account: "a",
      category_group: "opex",
      category: "ads",
      gross_amount: "10,00",
      business_timestamp: "2025-01-01",
    };
    const next = syncCategory(form, "category_group", "taxes", getGroup);
    expect(next.category).toBe("");
  });
}); 