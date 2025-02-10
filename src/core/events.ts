// src/core/events.ts
import { GrainElement } from "../types";
import { ElementCache } from "../cache";
import { store } from "../store";
import { deepClone, findClosestGrainElement } from "../utils";
import { updateElement } from "../batcher";
import { EVENT_TYPES } from "../constants";

export function setupEventListeners(el: GrainElement) {
  const handlers = new Map<HTMLElement, (event: Event) => void>();
  const cache = ElementCache.getCache(el) || ElementCache.cacheElements(el);
  console.log({ cache });

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

  const setupOnHandler = (element: HTMLElement) => {
    EVENT_TYPES.forEach((eventType) => {
      const attribute = `g-on:${eventType}`;
      if (element.hasAttribute(attribute)) {
        const handlerExpression = element.getAttribute(attribute)!;
        const handler = async (event: Event) => {
          event.preventDefault();
          const match = handlerExpression.match(/^(\w+)(?:\((.*)\))?$/);
          if (!match) return;

          const [, functionName, argsString] = match;
          const func = window[functionName];
          if (typeof func !== "function") return;

          let args: any[] = [];
          if (argsString) {
            args = argsString.split(",").map((arg) => {
              arg = arg.trim();
              return arg.startsWith("'") && arg.endsWith("'")
                ? arg.slice(1, -1)
                : arg;
            });
          }

          const grainEl = findClosestGrainElement(element);
          if (!grainEl) return;

          const context = {
            get: () => grainEl.$grain,
            set: (updates: any) => {
              Object.assign(grainEl.$grain, updates);
              updateElement(grainEl);
            },
          };

          await func(context, args);
        };

        element.addEventListener(eventType, handler);
        handlers.set(element, handler);
      }
    });
  };

  for (const element of cache.interactiveElements) {
    if (element.hasAttribute("g-action")) {
      setupActionHandler(element);
    }
    setupOnHandler(element);
  }

  const cleanup = () => {
    handlers.forEach((handler, element) => {
      element.removeEventListener("click", handler);
    });
    handlers.clear();
  };

  el.$cleanup = cleanup;
}
