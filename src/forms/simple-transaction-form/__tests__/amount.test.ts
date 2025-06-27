/// <reference types="jest" />

import { normalizeAmount, parseAmount, validateAmount } from "../utils/amount";

describe("amount utils", () => {
  it("normalizes comma decimal to dot", () => {
    expect(normalizeAmount("123,45")).toBe("123.45");
  });

  it("strips thousands separators", () => {
    expect(normalizeAmount("1.234,56")).toBe("1234.56");
  });

  it("parses amount to number", () => {
    expect(parseAmount("99,99")).toBeCloseTo(99.99);
  });

  it("validateAmount detects empty", () => {
    expect(validateAmount("")).toBe("Enter amount");
  });

  it("validateAmount detects zero/negative", () => {
    expect(validateAmount("0,00")).toBe("Enter valid amount greater than 0");
  });

  it("validateAmount passes valid amount", () => {
    expect(validateAmount("12,34")).toBeUndefined();
  });
}); 