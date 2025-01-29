// Grains.js
// A lightweight reactive micro-states management library for HTML

import diff from "microdiff";
import rfdc from "rfdc";
import { scheduleUpdate } from "./batch";
import { handleTextDirective } from "./directives/text";
import { applyDiff, findClosestGrainElement, getValueAtPath } from "./utils";

interface Grain {
  [key: string]: any;
}

interface GrainHistory {
  past: Grain[];
  future: Grain[];
}

type GrainElement = HTMLElement & {
  $grain: Grain;
  $originalValues: { [key: string]: string };
  $cleanup?: () => void;
};

type GrainContext = {
  get: (path: string) => any;
  set: (updates: Partial<Grain>) => void;
  getState: () => Grain;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
};

// Extend Window interface to allow dynamic properties
declare global {
  interface Window {
    [key: string]: any;
  }
}

const clone = rfdc();

function deepClone<T>(obj: T): T {
  return clone(obj);
}

const DIRECTIVES = [
  "g-state",
  "g-init",
  "g-text",
  "g-class",
  "g-click",
  "g-action",
  "g-args",
  "g-disabled",
  "g-show",
] as const;

// Store for all grain instances and their history
const grainStore = new Map<string, Grain>();
const grainHistory = new Map<string, GrainHistory>();

// Maximum number of history states to keep
const MAX_HISTORY = 50;

function bootstrap() {
  // Clean up existing grains
  grainStore.clear();
  grainHistory.clear();

  // Find all elements with g-state attribute and set them up
  document.querySelectorAll<HTMLElement>("[g-state]").forEach((el) => {
    setupGrain(el as GrainElement);
  });
}

function setupGrain(el: GrainElement) {
  const [stateName, _] = el.getAttribute("g-state")!.split(":");
  const initialState = el.hasAttribute("g-init")
    ? JSON.parse(el.getAttribute("g-init")!)
    : {};

  // Initialize history
  grainHistory.set(stateName, { past: [], future: [] });

  // Create reactive state with rfdc and microdiff
  const state = observe(initialState, () => {
    const history = grainHistory.get(stateName)!;
    const currentState = deepClone(el.$grain); // Clone the current state

    // Compute the diff and push it to history
    const lastState =
      history.past.length > 0
        ? applyDiff({}, history.past[history.past.length - 1]) // Reconstruct the last state from diffs
        : {};
    const diffs = diff(lastState, currentState);

    if (diffs.length > 0) {
      history.past.push(diffs);
      if (history.past.length > MAX_HISTORY) history.past.shift();
      history.future = []; // Clear future on new changes
    }

    updateElement(el); // Update the DOM
  });

  // Store the grain instance
  grainStore.set(stateName, state);
  el.$grain = state;

  // Create cleanup function
  el.$cleanup = () => {
    grainStore.delete(stateName);
    grainHistory.delete(stateName);
    delete window[stateName];
  };

  // Expose state on the window
  window[stateName] = state;

  // Setup event listeners and initial update
  setupEventListeners(el);
  updateElement(el);
}

function setupEventListeners(el: GrainElement) {
  const handlers = new Map<HTMLElement, (event: Event) => void>();

  // Setup click handlers
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

  // Setup action handlers
  const setupActionHandler = (actionEl: HTMLElement) => {
    const handler = async (event: Event) => {
      event.preventDefault();
      const action = actionEl.getAttribute("g-action")!;
      const grainEl = findClosestGrainElement(actionEl);
      if (!grainEl) return;

      const stateName = grainEl.getAttribute("g-state")!.split(":")[0];
      const history = grainHistory.get(stateName)!;

      try {
        switch (action) {
          case "undo":
            if (history.past.length > 0) {
              const previousState = history.past.pop()!;
              history.future.push(deepClone(grainEl.$grain));
              Object.assign(grainEl.$grain, previousState);
              updateElement(grainEl);
            }
            break;
          case "redo":
            if (history.future.length > 0) {
              const nextState = history.future.pop()!;
              history.past.push(deepClone(grainEl.$grain));
              Object.assign(grainEl.$grain, nextState);
              updateElement(grainEl);
            }
            break;
          default:
            console.warn(`Unknown action: ${action}`);
        }
      } catch (error) {
        console.error(`Error in action handler "${action}":`, error);
      }
    };

    actionEl.addEventListener("click", handler);
    handlers.set(actionEl, handler);
  };

  // Find and setup all click handlers
  const clickElements = Array.from(
    el.querySelectorAll("[g-click]")
  ) as HTMLElement[];
  clickElements.forEach(setupClickHandler);
  if (el.hasAttribute("g-click")) {
    setupClickHandler(el);
  }

  // Find and setup all action handlers
  const actionElements = Array.from(
    el.querySelectorAll("[g-action]")
  ) as HTMLElement[];
  actionElements.forEach(setupActionHandler);
  if (el.hasAttribute("g-action")) {
    setupActionHandler(el);
  }

  // Store cleanup function
  const originalCleanup = el.$cleanup || (() => {});
  el.$cleanup = () => {
    handlers.forEach((handler, element) => {
      element.removeEventListener("click", handler);
    });
    handlers.clear();
    originalCleanup();
  };
}

function updateElement(el: GrainElement) {
  // Schedule updates for the element and its children
  scheduleUpdate(el, updateElementContent);

  DIRECTIVES.forEach((directive) => {
    el.querySelectorAll(`[${directive}]`).forEach((child) => {
      if (child instanceof HTMLElement) {
        scheduleUpdate(child, updateElementContent);
      }
    });
  });
}

function updateElementContent(el: HTMLElement) {
  DIRECTIVES.forEach((directive) => {
    if (el.hasAttribute(directive)) {
      const value = el.getAttribute(directive)!;

      if (directive === "g-text") {
        handleTextDirective(el, value);
      } else if (directive === "g-class") {
        updateClasses(el as GrainElement, value);
      } else if (directive === "g-disabled") {
        const grainEl = findClosestGrainElement(el);
        if (grainEl && el instanceof HTMLButtonElement) {
          const action = el.getAttribute("g-action");
          if (action === "undo" || action === "redo") {
            const stateName = grainEl.getAttribute("g-state")!.split(":")[0];
            const history = grainHistory.get(stateName)!;
            el.disabled =
              action === "undo"
                ? history.past.length === 0
                : history.future.length === 0;
          }
        }
      } else if (directive === "g-show") {
        const grainEl = findClosestGrainElement(el);
        if (grainEl) {
          try {
            const [prop, op, compareValue] = value.split(/\s+/);
            const stateValue = getValueAtPath(grainEl.$grain, prop);
            const parsedCompareValue = JSON.parse(compareValue);
            let show = false;

            switch (op) {
              case "==":
                show = stateValue == parsedCompareValue;
                break;
              case "===":
                show = stateValue === parsedCompareValue;
                break;
              case "!=":
                show = stateValue != parsedCompareValue;
                break;
              case "!==":
                show = stateValue !== parsedCompareValue;
                break;
              case ">":
                show = stateValue > parsedCompareValue;
                break;
              case ">=":
                show = stateValue >= parsedCompareValue;
                break;
              case "<":
                show = stateValue < parsedCompareValue;
                break;
              case "<=":
                show = stateValue <= parsedCompareValue;
                break;
              default:
                console.error(`Unsupported operator: ${op}`);
            }

            el.style.display = show ? "" : "none";
          } catch (error) {
            console.error("Error evaluating g-show:", error);
          }
        }
      }
    }
  });
}

function updateClasses(el: GrainElement, value: string) {
  try {
    const expr = resolvePlaceholders(el, value);
    const result = Function(`return ${expr}`)();

    if (typeof result === "string") {
      el.className = result;
    } else if (typeof result === "object") {
      Object.entries(result).forEach(([className, active]) => {
        el.classList.toggle(className, !!active);
      });
    }
  } catch (error) {
    console.error("Error updating classes:", error);
  }
}

function resolvePlaceholders(el: GrainElement, str: string): string {
  return str.replace(/\{([^}]+)\}/g, (_, path) =>
    JSON.stringify(getValueAtPath(el.$grain, path))
  );
}

function callGrainFunction(
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
  const history = grainHistory.get(stateName)!;

  const context: GrainContext = {
    get: (path: string) => getValueAtPath(el.$grain, path),
    set: (updates: Partial<Grain>) => {
      const newState = { ...deepClone(el.$grain), ...updates };
      if (JSON.stringify(newState) !== JSON.stringify(el.$grain)) {
        history.past.push(deepClone(el.$grain));
        if (history.past.length > MAX_HISTORY) {
          history.past.shift();
        }
        history.future = [];
        Object.assign(el.$grain, newState);
        updateElement(el);
      }
    },
    getState: () => deepClone(el.$grain),
    undo: () => {
      if (history.past.length > 0) {
        const previousState = history.past.pop()!;
        history.future.push(deepClone(el.$grain));
        Object.assign(el.$grain, previousState);
        updateElement(el);
      }
    },
    redo: () => {
      if (history.future.length > 0) {
        const nextState = history.future.pop()!;
        history.past.push(deepClone(el.$grain));
        Object.assign(el.$grain, nextState);
        updateElement(el);
      }
    },
    canUndo: () => history.past.length > 0,
    canRedo: () => history.future.length > 0,
  };

  // Handle both sync and async functions
  const result = updates ? func({ ...context }, updates) : func(context, args);
  return Promise.resolve(result);
}

export function observe<T extends object>(obj: T, callback: () => void): T {
  const handler: ProxyHandler<T> = {
    get(target: T, property: string | symbol): any {
      const value = Reflect.get(target, property);
      if (value && typeof value === "object") {
        return observe(value, callback);
      }
      return value;
    },
    set(target: T, property: string | symbol, value: any): boolean {
      const result = Reflect.set(target, property, value);
      callback();
      return result;
    },
    deleteProperty(target: T, property: string | symbol): boolean {
      const result = Reflect.deleteProperty(target, property);
      callback();
      return result;
    },
  };

  return new Proxy(obj, handler);
}

// Initialize on DOM ready and export for testing
window.addEventListener("DOMContentLoaded", bootstrap);
export {
  bootstrap,
  findClosestGrainElement,
  grainStore,
  setupGrain,
  updateElement,
};
export type { Grain, GrainContext, GrainElement };
