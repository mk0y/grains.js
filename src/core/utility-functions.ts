// src/utility-functions.ts
import { store } from "../store";
import { GrainElement } from "../types";
import { getValueAtPath } from "../utils";

export const UTILITY_FUNCTIONS: Record<
  string,
  (el: GrainElement, ...args: any[]) => boolean
> = {
  canUndo: (el) => {
    const stateName = el.getAttribute("g-state")!.split(":")[0];
    const history = store.getHistory(stateName);
    if (history) {
      return history?.past.length > 0;
    } else {
      return false;
    }
  },
  canRedo: (el) => {
    const stateName = el.getAttribute("g-state")!.split(":")[0];
    const history = store.getHistory(stateName);
    if (history) {
      return history?.future.length > 0;
    } else {
      return false;
    }
  },
  // Value checks with parameters
  isPositive: (el: GrainElement, path: string) => {
    return getValueAtPath(el.$grain, path) > 0;
  },
  isNegative: (el: GrainElement, path: string) => {
    return getValueAtPath(el.$grain, path) < 0;
  },
  isEmpty: (el: GrainElement, path: string) => {
    const value = getValueAtPath(el.$grain, path);
    return value === 0 || value === "" || value === null;
  },
  equals: (el: GrainElement, path: string, compareValue: any) => {
    return getValueAtPath(el.$grain, path) === compareValue;
  },
} as const;

export type UtilityFunction = keyof typeof UTILITY_FUNCTIONS;
