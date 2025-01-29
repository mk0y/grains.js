import diff from "microdiff";
import { describe, expect, it } from "vitest";
import { applyDiff } from "../utils";

describe("applyDiff", () => {
  it("should apply create diffs", () => {
    const target = { a: 1 };
    const newObj = { a: 1, b: { c: 2 } };
    const diffs = diff(target, newObj);

    const result = applyDiff(target, diffs);
    expect(result).toEqual(newObj);
  });

  it("should apply change diffs", () => {
    const target = { a: 1, b: 2 };
    const newObj = { a: 1, b: 3 };
    const diffs = diff(target, newObj);

    const result = applyDiff(target, diffs);
    expect(result).toEqual(newObj);
  });

  it("should apply remove diffs", () => {
    const target = { a: 1, b: 2 };
    const newObj = { a: 1 };
    const diffs = diff(target, newObj);

    const result = applyDiff(target, diffs);
    expect(result).toEqual(newObj);
  });

  it("should handle nested object changes", () => {
    const target = { a: { b: { c: 1 } }, d: 2 };
    const newObj = { a: { b: { c: 3 } }, d: 4 };
    const diffs = diff(target, newObj);

    const result = applyDiff(target, diffs);
    expect(result).toEqual(newObj);
  });
});
