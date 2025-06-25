/// <reference types="jest" />

import { validateExpenseForm } from "../utils/validation";

describe("validateExpenseForm", () => {
  const base = {
    account: "mbank_osobiste",
    category_group: "opex",
    category: "ads",
    gross_amount: "10,00",
    business_timestamp: "2025-01-01",
  } as const;

  it("returns empty errors when form valid", () => {
    expect(validateExpenseForm({ ...base })).toEqual({});
  });

  it("flags missing account", () => {
    const errors = validateExpenseForm({ ...base, account: "" });
    expect(errors.account).toBe("Select account");
  });

  it("flags missing amount", () => {
    const errors = validateExpenseForm({ ...base, gross_amount: "" });
    expect(errors.gross_amount).toBe("Enter amount");
  });
}); 