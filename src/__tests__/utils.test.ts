import diff from "microdiff";
import { describe, expect, it } from "vitest";
import {
  applyDiff,
  deepClone,
  findClosestGrainElement,
  getValueAtPath,
} from "../utils";

describe("utils", () => {
  describe("deepClone", () => {
    it("should create a deep clone of an object", () => {
      const obj = { a: 1, b: { c: 2 } };
      const clonedObj = deepClone(obj);
      expect(clonedObj).toEqual(obj);
      expect(clonedObj).not.toBe(obj);
    });

    it("should handle nested objects", () => {
      const obj = { a: 1, b: { c: 2, d: { e: 3 } } };
      const clonedObj = deepClone(obj);
      expect(clonedObj).toEqual(obj);
      expect(clonedObj).not.toBe(obj);
      expect(clonedObj.b).not.toBe(obj.b);
      expect(clonedObj.b.d).not.toBe(obj.b.d);
    });

    it("should handle arrays", () => {
      const arr = [1, 2, { a: 3 }];
      const clonedArr = deepClone(arr);
      expect(clonedArr).toEqual(arr);
      expect(clonedArr).not.toBe(arr);
      expect(clonedArr[2]).not.toBe(arr[2]);
    });
  });

  describe("findClosestGrainElement", () => {
    it("should find the closest ancestor with g-state attribute", () => {
      const grainDiv = document.createElement("div");
      grainDiv.setAttribute("g-state", "test");
      const childDiv = document.createElement("div");
      grainDiv.appendChild(childDiv);
      const closest = findClosestGrainElement(childDiv);
      expect(closest).toBe(grainDiv);
    });

    it("should return null if no ancestor has g-state attribute", () => {
      const div = document.createElement("div");
      const closest = findClosestGrainElement(div);
      expect(closest).toBe(null);
    });

    it("should handle nested elements", () => {
      const grainDiv = document.createElement("div");
      grainDiv.setAttribute("g-state", "test");
      const div2 = document.createElement("div");
      const div3 = document.createElement("div");
      grainDiv.appendChild(div2);
      div2.appendChild(div3);

      expect(findClosestGrainElement(div3)).toBe(grainDiv);
      expect(findClosestGrainElement(div2)).toBe(grainDiv);
      //Adding a test case where the element itself has g-state
      grainDiv.setAttribute("g-state", "test2");
      expect(findClosestGrainElement(grainDiv)).toBe(grainDiv);
    });
  });

  describe("getValueAtPath", () => {
    it("should get the value at a given path", () => {
      const obj = { a: 1, b: { c: 2 } };
      expect(getValueAtPath(obj, "a")).toBe(1);
      expect(getValueAtPath(obj, "b.c")).toBe(2);
      expect(getValueAtPath(obj, "b.d")).toBe(undefined);
      expect(getValueAtPath(obj, "a.b")).toBe(undefined);
    });
  });

  describe("applyDiff", () => {
    it("should apply diffs to the target object", () => {
      const target = { a: 1, b: { c: 2 } };
      const diffs = diff(target, { a: 3, b: { c: 4, d: 5 } });
      const result = applyDiff(deepClone(target), diffs);
      expect(result).toEqual({ a: 3, b: { c: 4, d: 5 } });
    });

    it("should handle remove diff", () => {
      const target = { a: 1, b: { c: 2 } };
      const diffs = diff(target, { a: 1 });
      const result = applyDiff(deepClone(target), diffs);
      expect(result).toEqual({ a: 1 });
    });

    it("should handle nested diffs", () => {
      const target = { a: 1, b: { c: 2, d: 3 } };
      const diffs = diff(target, { a: 1, b: { c: 4, e: 5 } });
      const result = applyDiff(deepClone(target), diffs);
      expect(result).toEqual({ a: 1, b: { c: 4, e: 5 } });
    });
  });
});
