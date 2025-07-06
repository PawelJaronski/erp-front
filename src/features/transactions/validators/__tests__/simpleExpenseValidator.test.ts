/// <reference types="jest" />

import { simpleExpenseValidator } from "../simpleExpenseValidator";
import type { SimpleExpenseFormData } from "../../types";
import { describe, it, expect } from '@jest/globals';

// Helper: provide minimal valid payload
const validBase: SimpleExpenseFormData = {
  account: "mbank_osobiste",
  category_group: "opex",
  category: "ads",
  gross_amount: "10,00",
  business_timestamp: "2025-01-01",
  include_tax: false,
  tax_rate: 23,
  custom_category_group: "",
  custom_category: "",
};

describe("simpleExpenseValidator", () => {
  it("returns empty object when data is valid", () => {
    const errors = simpleExpenseValidator({ ...validBase });
    expect(errors).toEqual({});
  });

  it("flags missing account", () => {
    const errors = simpleExpenseValidator({ ...validBase, account: "" });
    expect(errors.account).toBe("Select account");
  });

  it("flags missing amount", () => {
    const errors = simpleExpenseValidator({ ...validBase, gross_amount: "" });
    expect(errors.gross_amount).toBe("Enter amount");
  });

  it("flags missing business date", () => {
    const errors = simpleExpenseValidator({ ...validBase, business_timestamp: "" });
    expect(errors.business_timestamp).toBe("Select date");
  });

  it("handles custom category path correctly", () => {
    const data: SimpleExpenseFormData = {
      ...validBase,
      category_group: "other",
      custom_category_group: "my_group",
      category: "other",
      custom_category: "my_cat",
    };
    const errors = simpleExpenseValidator(data);
    expect(errors).toEqual({});
  });
}); 