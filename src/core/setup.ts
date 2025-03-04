// src/core/setup.ts
import UpdateBatcher from "../batcher";
import { ElementCache } from "../cache";
import { updateElementContent } from "../directives/base";
import { store } from "../store";
import { Grain, GrainElement } from "../types";
import { deepClone } from "../utils";
import { setupEventListeners } from "./events";
import { observe } from "./observe";

function getInitValue(el: GrainElement): Grain {
  const gInitVal = el.getAttribute("g-init");
  if (gInitVal) {
    try {
      // Attempt to parse as JSON first
      return JSON.parse(gInitVal);
    } catch (jsonError) {
      //If not valid JSON, try global variable
      const globalVarName = gInitVal.trim();
      if (globalVarName in window) {
        const globalVar = window[globalVarName];
        if (typeof globalVar === "object") {
          return globalVar;
        } else {
          console.error(
            `[Grains.js] Global variable "${globalVarName}" is not an object. Using empty object. Grain: `,
            el
          );
          return {};
        }
      } else {
        console.warn(
          `[Grains.js] g-init attribute "${globalVarName}" is neither valid JSON nor a reference to a global object variable. Using empty object as initial state. Grain: `,
          el
        );
        return {};
      }
    }
  }
  return {};
}

export function setupGrain(el: GrainElement) {
  const [stateName, _] = el.getAttribute("g-state")!.split(":");
  const initialState = getInitValue(el);

  // Initialize state and history
  store.initHistory(stateName);
  el.$grain = deepClone(initialState);

  // Cache elements and perform initial update
  const cache = ElementCache.cacheElements(el);

  // Single pass through elements using unified directive handler
  for (const element of cache.allElements) {
    if (element instanceof HTMLElement) {
      updateElementContent(element);
    }
  }

  // Setup reactive state
  const state = observe(initialState, () => {
    UpdateBatcher.scheduleUpdate(el);
  });

  // Store state and setup cleanup
  store.set(stateName, state);
  el.$grain = state;

  el.$cleanup = () => {
    store.delete(stateName);
    ElementCache.clearCache(el);
    delete window[stateName];
  };

  window[stateName] = state;
  setupEventListeners(el);
}
