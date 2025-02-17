// src/core/events.ts
import { GrainElement } from "../types";
import { ElementCache } from "../cache";
import { setupOnDirective } from "../directives/on";
import { setupActionDirective } from "../directives/action";

export function setupEventListeners(el: GrainElement) {
  const handlers = new Map<HTMLElement, Map<string, (event: Event) => void>>();
  const cache = ElementCache.getCache(el) || ElementCache.cacheElements(el);

  for (const element of cache.interactiveElements) {
    setupOnDirective(element, handlers);
    setupActionDirective(element, handlers);
  }

  el.$cleanup = () => {
    handlers.forEach((elementHandlers, element) => {
      elementHandlers.forEach((handler, eventName) => {
        element.removeEventListener(eventName, handler);
      });
    });
    handlers.clear();
  };
}
