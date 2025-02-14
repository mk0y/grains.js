// src/core/context.ts
import { Grain, GrainElement, GrainContext } from "../types";
import { store } from "../store";
import { deepClone, getValueAtPath } from "../utils";
import { MAX_HISTORY } from "../constants";
import UpdateBatcher, { updateElement } from "../batcher";

export function callGrainFunction(
  el: GrainElement,
  funcName: string,
  updates?: Grain,
  args: any[] = [],
): Promise<void> {
  const func = window[funcName];
  if (typeof func !== "function") {
    throw new Error(`Function '${funcName}' not defined`);
  }

  const stateName = el.getAttribute("g-state")!.split(":")[0];
  const history = store.getHistory(stateName)!;

  const context: GrainContext = {
    get: (path: string) => getValueAtPath(el.$grain, path),
    set: (updates: Partial<Grain>) => {
      const newState = { ...deepClone(el.$grain), ...updates };
      if (JSON.stringify(newState) !== JSON.stringify(el.$grain)) {
        const currentState = deepClone(el.$grain);
        Object.assign(el.$grain, newState);
        history.past.push(currentState);
        if (history.past.length > MAX_HISTORY) {
          history.past.shift();
        }
        history.future = [];
        UpdateBatcher.scheduleUpdate(el);
      }
    },
    getState: () => deepClone(el.$grain),
    undo: () => {
      if (history.past.length > 0) {
        const currentState = deepClone(el.$grain);
        const previousState = history.past.pop()!;
        history.future.push(currentState);
        Object.assign(el.$grain, previousState);
        updateElement(el);
      }
    },
    redo: () => {
      if (history.future.length > 0) {
        const currentState = deepClone(el.$grain);
        const nextState = history.future.pop()!;
        history.past.push(currentState);
        Object.assign(el.$grain, nextState);
        updateElement(el);
      }
    },
    canUndo: () => history.past.length > 0,
    canRedo: () => history.future.length > 0,
  };

  const result = updates ? func(context, updates) : func(context, args);
  return Promise.resolve(result);
}
