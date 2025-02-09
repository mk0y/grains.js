// src/core/setup.ts
import { GrainElement } from "../types";
import { store } from "../store";
import { deepClone } from "../utils";
import { ElementCache } from "../cache";
import { updateElementContent } from "../directives/base";
import UpdateBatcher from "../batcher";
import { setupEventListeners } from "./events";
import { observe } from "./observe";

export function setupGrain(el: GrainElement) {
  const [stateName, _] = el.getAttribute("g-state")!.split(":");
  const initialState = el.hasAttribute("g-init")
    ? JSON.parse(el.getAttribute("g-init")!)
    : {};

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
