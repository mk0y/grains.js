// src/core/setup.ts
import { GrainElement } from "../types";
import { store } from "../store";
import { deepClone } from "../utils/utils";
import { ElementCache } from "../cache";
import { updateElementContent } from "../directives/base";
import UpdateBatcher from "../batcher";
import { setupEventListeners } from "./events";
import { observe } from "./observe";
import { initializeState } from "../utils/initialization";

export async function setupGrain(el: GrainElement) {
  const [stateName, _] = el.getAttribute("g-state")!.split(":");
  const gInit = el.getAttribute("g-init");
  console.log(gInit);
  let initialState = {};

  if (gInit) {
    const result = await initializeState(gInit);
    console.log({ result });

    if (!result.success) {
      console.error(result.error || "Failed to initialize state");
      return;
    }

    initialState = result.value ?? {};
  } else {
    console.warn("Initial state hasn't been set");
  }

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
