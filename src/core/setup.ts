// src/core/setup.ts
import { GrainElement } from "../types";
import { store } from "../store";
import { deepClone } from "../utils";
import { ElementCache } from "../cache";
import { handleTextDirective } from "../directives/text";
import { handleShowDirective } from "../directives/show";
import { updateDisabledState } from "../directives/disabled";
import UpdateBatcher from "../batcher";
import { setupEventListeners } from "./events";
import { observe } from "./observe";

export function setupGrain(el: GrainElement) {
  const [stateName, _] = el.getAttribute("g-state")!.split(":");
  const initialState = el.hasAttribute("g-init")
    ? JSON.parse(el.getAttribute("g-init")!)
    : {};

  store.initHistory(stateName);
  el.$grain = deepClone(initialState);

  const cache = ElementCache.cacheElements(el);

  for (const element of cache.allElements) {
    if (element instanceof HTMLElement) {
      if (element.hasAttribute("g-text")) {
        handleTextDirective(element, element.getAttribute("g-text")!);
      }
      if (element.hasAttribute("g-show")) {
        handleShowDirective(element, element.getAttribute("g-show")!);
      }
      if (element.hasAttribute("g-disabled")) {
        updateDisabledState(el, stateName);
      }
    }
  }

  const state = observe(initialState, () => {
    UpdateBatcher.scheduleUpdate(el);
  });

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
