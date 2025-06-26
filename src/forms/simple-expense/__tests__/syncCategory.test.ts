// Jest globals are available via ts-jest configuration
/// <reference types="jest" />

import { syncCategory } from "../utils/syncCategory";
import type { ExpenseFormShape } from "../utils/validation";

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
      transaction_type: "expense",
      include_tax: false,
      tax_rate: 23,
    };
    const next = syncCategory(form, "category", "ads", getGroup);
    expect(next.category_group).toBe("opex");
  });

  it("keeps category intact when category_group changes to a different one", () => {
    const form: ExpenseFormShape = {
      account: "a",
      category_group: "opex",
      category: "ads",
      gross_amount: "10,00",
      business_timestamp: "2025-01-01",
      transaction_type: "expense",
      include_tax: false,
      tax_rate: 23,
    };
    const next = syncCategory(form, "category_group", "taxes", getGroup);
    expect(next.category).toBe("ads");
  });

  it("does not override category_group when group is 'other'", () => {
    const form: ExpenseFormShape = {
      account: "a",
      category_group: "other",
      custom_category_group: "my_custom_grp",
      category: "ads", // initial category doesn't matter
      gross_amount: "10,00",
      business_timestamp: "2025-01-01",
      transaction_type: "expense",
      include_tax: false,
      tax_rate: 23,
    };

    // User changes category to something else
    const next = syncCategory(form, "category", "vat", getGroup);
    expect(next.category_group).toBe("other");
    expect(next.custom_category_group).toBe("my_custom_grp");
  });
}); 