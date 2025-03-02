// src/__tests__/utility-functions.test.ts
import { describe, expect, it } from "vitest";
import { UTILITY_FUNCTIONS, UtilityFunction } from "../core/utility-functions";
import { GrainElement } from "../types";

describe("utility-functions.d.ts", () => {
  it("should define UTILITY_FUNCTIONS as a Record", () => {
    expect(UTILITY_FUNCTIONS).toBeTypeOf("object");
    expect(UTILITY_FUNCTIONS).toHaveProperty("canUndo");
    expect(UTILITY_FUNCTIONS).toHaveProperty("canRedo");
    expect(UTILITY_FUNCTIONS).toHaveProperty("isPositive");
    expect(UTILITY_FUNCTIONS).toHaveProperty("isNegative");
    expect(UTILITY_FUNCTIONS).toHaveProperty("isEmpty");
    expect(UTILITY_FUNCTIONS).toHaveProperty("equals");
  });

  it("should correctly type UTILITY_FUNCTIONS values", () => {
    // Create a mock GrainElement for testing purposes.
    // We only need to satisfy the type requirements, the actual values won't be used.
    const mockGrainElement = {
      $grain: {},
      $originalValues: {},
      $cleanup: () => {},
      getAttribute: (attrName: string) =>
        attrName === "g-state" ? "testState" : null,
      hasAttribute: (attrName: string) => attrName === "g-state",
    } as unknown as GrainElement;

    type FunctionType = (el: GrainElement, ...args: any[]) => boolean;

    // Test each function's type
    expect(UTILITY_FUNCTIONS.canUndo).toBeTypeOf("function");
    expect(
      (UTILITY_FUNCTIONS.canUndo as FunctionType)(mockGrainElement)
    ).toBeTypeOf("boolean");

    expect(UTILITY_FUNCTIONS.canRedo).toBeTypeOf("function");
    expect(
      (UTILITY_FUNCTIONS.canRedo as FunctionType)(mockGrainElement)
    ).toBeTypeOf("boolean");

    expect(UTILITY_FUNCTIONS.isPositive).toBeTypeOf("function");
    expect(
      (UTILITY_FUNCTIONS.isPositive as FunctionType)(
        mockGrainElement,
        "somePath"
      )
    ).toBeTypeOf("boolean");

    expect(UTILITY_FUNCTIONS.isNegative).toBeTypeOf("function");
    expect(
      (UTILITY_FUNCTIONS.isNegative as FunctionType)(
        mockGrainElement,
        "somePath"
      )
    ).toBeTypeOf("boolean");

    expect(UTILITY_FUNCTIONS.isEmpty).toBeTypeOf("function");
    expect(
      (UTILITY_FUNCTIONS.isEmpty as FunctionType)(mockGrainElement, "somePath")
    ).toBeTypeOf("boolean");

    expect(UTILITY_FUNCTIONS.equals).toBeTypeOf("function");
    expect(
      (UTILITY_FUNCTIONS.equals as FunctionType)(
        mockGrainElement,
        "somePath",
        5
      )
    ).toBeTypeOf("boolean");
  });

  it("UtilityFunction type should be correct", () => {
    // This test simply verifies that the type 'UtilityFunction' is correctly inferred.
    // No assertion is needed, the type checking itself is the test.
    const func: UtilityFunction = "canUndo";
    expect(func).toBe("canUndo");
  });
});
