// src/core/events.ts
import { GrainElement } from "../types";
import { ElementCache } from "../cache";
import { store } from "../store";
import { deepClone, findClosestGrainElement } from "../utils";
import { callGrainFunction } from "./function";
import { updateElement } from "../batcher";

export function setupEventListeners(el: GrainElement) {
  const handlers = new Map<HTMLElement, (event: Event) => void>();
  const cache = ElementCache.getCache(el) || ElementCache.cacheElements(el);

  const setupClickHandler = (clickEl: HTMLElement) => {
    const handler = async (event: Event) => {
      event.preventDefault();
      const funcName = clickEl.getAttribute("g-click")!;
      const args = clickEl.hasAttribute("g-args")
        ? JSON.parse(clickEl.getAttribute("g-args")!)
        : [];

      try {
        const grainEl = findClosestGrainElement(clickEl);
        if (grainEl) {
          await callGrainFunction(grainEl, funcName, undefined, args);
        }
      } catch (error) {
        console.error(`Error in click handler "${funcName}":`, error);
      }
    };

    clickEl.addEventListener("click", handler);
    handlers.set(clickEl, handler);
  };

  const setupActionHandler = (actionEl: HTMLElement) => {
    const handler = async (event: Event) => {
      event.preventDefault();
      const action = actionEl.getAttribute("g-action")!;
      const grainEl = findClosestGrainElement(actionEl);

      if (grainEl) {
        const stateName = grainEl.getAttribute("g-state")!.split(":")[0];
        const history = store.getHistory(stateName)!;

        if (action === "undo" && history.past.length > 0) {
          const currentState = deepClone(grainEl.$grain);
          const previousState = history.past.pop()!;
          history.future.push(currentState);
          Object.assign(grainEl.$grain, previousState);
          updateElement(grainEl);
        } else if (action === "redo" && history.future.length > 0) {
          const currentState = deepClone(grainEl.$grain);
          const nextState = history.future.pop()!;
          history.past.push(currentState);
          Object.assign(grainEl.$grain, nextState);
          updateElement(grainEl);
        }
      }
    };

    actionEl.addEventListener("click", handler);
    handlers.set(actionEl, handler);
  };

  for (const element of cache.interactiveElements) {
    if (element.hasAttribute("g-click")) {
      setupClickHandler(element);
    }
    if (element.hasAttribute("g-action")) {
      setupActionHandler(element);
    }
  }

  const cleanup = () => {
    handlers.forEach((handler, element) => {
      element.removeEventListener("click", handler);
    });
    handlers.clear();
  };

  el.$cleanup = cleanup;
}
