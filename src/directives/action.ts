// src/core/directives/action.ts
import { store } from "../store";
import { deepClone, findClosestGrainElement } from "../utils";
import { updateElement } from "../batcher";

export function createActionHandler(
  actionEl: HTMLElement,
): (event: Event) => Promise<void> {
  const action = actionEl.getAttribute("g-action");

  if (!action || !["undo", "redo"].includes(action)) {
    console.warn(
      '[Grains.js] Invalid g-action value. Must be either "undo" or "redo". Element:',
      actionEl,
    );
    return async () => {};
  }

  return async (event: Event) => {
    event.preventDefault();
    const grainEl = findClosestGrainElement(actionEl);
    if (!grainEl) {
      console.warn(
        "[Grains.js] No parent grain element found for action handler. Element:",
        actionEl,
      );
      return;
    }

    const stateName = grainEl.getAttribute("g-state");
    if (!stateName) {
      console.warn(
        "[Grains.js] No g-state attribute found on grain element. Element:",
        grainEl,
      );
      return;
    }

    const history = store.getHistory(stateName.split(":")[0]);
    if (!history) {
      console.warn("[Grains.js] No history found for state:", stateName);
      return;
    }

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
  };
}

export function setupActionDirective(
  element: HTMLElement,
  handlers: Map<HTMLElement, Map<string, (event: Event) => void>>,
) {
  if (element.hasAttribute("g-action")) {
    const handler = createActionHandler(element);
    element.addEventListener("click", handler);

    if (!handlers.has(element)) {
      handlers.set(element, new Map());
    }
    handlers.get(element)!.set("click", handler);
  }
}
