/// <reference types="jest" />

import { renderHook, act } from "@testing-library/react";
import { useSimpleExpenseForm } from "../hooks/useSimpleExpenseForm";

// Helper to flush promises
const flushPromises = () => new Promise((r) => setTimeout(r, 0));

describe("useSimpleExpenseForm hook", () => {
  beforeEach(() => {
    // @ts-ignore
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("submits valid form and resets", async () => {
    const { result } = renderHook(() => useSimpleExpenseForm());

    act(() => {
      result.current.handlers.handleFieldChange("category", "ads");
      result.current.handlers.handleAmountChange("10,00");
    });

    await act(async () => {
      await result.current.submit();
      await flushPromises();
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    // after success the gross_amount should reset
    expect(result.current.fields.gross_amount).toBe("");
    expect(result.current.errors).toEqual({});
  });

  it("returns validation errors for missing amount", async () => {
    const { result } = renderHook(() => useSimpleExpenseForm());

    act(() => {
      result.current.handlers.handleFieldChange("category", "ads");
      result.current.handlers.handleFieldChange(
        "gross_amount",
        "" // intentionally empty
      );
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(global.fetch).not.toHaveBeenCalled();
    expect(result.current.errors.gross_amount).toBe("Enter amount");
  });
}); 