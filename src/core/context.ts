// src/core/context.ts
import UpdateBatcher, { updateElement } from "../batcher";
import { MAX_HISTORY } from "../constants";
import { store } from "../store";
import { Grain, GrainContext, GrainElement } from "../types";
import { deepClone, getValueAtPath } from "../utils";

export function callGrainFunction(
  el: GrainElement,
  funcName: string,
  updates?: Grain,
  args: any[] = []
): Promise<void> {
  const func = window[funcName];
  if (typeof func !== "function") {
    throw new Error(`Function '${funcName}' not defined`);
  }

  const stateName = el.getAttribute("g-state")!.split(":")[0];
  const history = store.getHistory(stateName)!;

  // Create a map of other states' contexts
  const otherStates = Object.fromEntries(
    Array.from(store.getAllStates())
      .filter(([name]) => name !== stateName) // Exclude current state
      .map(([name, grain]) => [
        name,
        {
          get: (path: string) => getValueAtPath(grain, path),
          set: (updates: Partial<Grain>) => {
            const grainEl = document.querySelector(
              `[g-state^="${name}"]`
            ) as GrainElement;
            if (grainEl) {
              const stateHistory = store.getHistory(name)!;
              const currentState = deepClone(grain);
              Object.assign(grain, { ...deepClone(grain), ...updates });
              stateHistory.past.push(currentState);
              if (stateHistory.past.length > MAX_HISTORY) {
                stateHistory.past.shift();
              }
              stateHistory.future = [];
              UpdateBatcher.scheduleUpdate(grainEl);
            }
          },
        },
      ])
  );

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
    states: new Proxy(otherStates, {
      get(target, prop) {
        if (typeof prop === "string" && !(prop in target)) {
          console.warn(
            `[Grains.js] attempting to access non-existent state "${prop}"`
          );
        }
        return target[prop as string];
      },
    }),
  };

  const result = updates ? func(context, updates) : func(context, args);
  return Promise.resolve(result);
}
