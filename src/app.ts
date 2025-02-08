// Grains.js
// A lightweight reactive micro-states management library for HTML

import rfdc from "rfdc";
import { handleShowDirective } from "./directives/show";
import { handleTextDirective } from "./directives/text";
import { findClosestGrainElement, getValueAtPath } from "./utils";

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

export function observe<T extends object>(obj: T, callback: () => void): T {
  const handler: ProxyHandler<T> = {
    get(target: T, property: string | symbol): any {
      const value = Reflect.get(target, property);
      if (value && typeof value === "object" && !Array.isArray(value)) {
        return observe(value, callback);
      }
      return value;
    },

    set(target: T, property: string | symbol, value: any): boolean {
      const oldValue = Reflect.get(target, property);
      const result = Reflect.set(target, property, value);

      if (oldValue !== value) {
        callback();
      }

      return result;
    },

    deleteProperty(target: T, property: string | symbol): boolean {
      const hadProperty = property in target;
      const result = Reflect.deleteProperty(target, property);

      if (hadProperty) {
        callback();
      }

      return result;
    },
  };

  return new Proxy(obj, handler);
}

function setupGrain(el: GrainElement) {
  const [stateName, _] = el.getAttribute("g-state")!.split(":");
  const initialState = el.hasAttribute("g-init")
    ? JSON.parse(el.getAttribute("g-init")!)
    : {};

  // Initialize history with initial state
  grainHistory.set(stateName, {
    past: [],
    future: [],
  });

  // Store initial state before creating reactive proxy
  el.$grain = deepClone(initialState);

  // Update content immediately with initial state using a single query
  const selector = "[g-text], [g-show]";
  el.querySelectorAll(selector).forEach((element) => {
    if (element instanceof HTMLElement) {
      if (element.hasAttribute("g-text")) {
        handleTextDirective(element, element.getAttribute("g-text")!);
      }
      if (element.hasAttribute("g-show")) {
        handleShowDirective(element, element.getAttribute("g-show")!);
      }
    }
  });

  // Create reactive state with rfdc and microdiff
  const state = observe(initialState, () => {
    // Schedule DOM updates
    updateElement(el);
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

  // Setup event listeners
  setupEventListeners(el);
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

      if (grainEl) {
        const stateName = grainEl.getAttribute("g-state")!.split(":")[0];
        const history = grainHistory.get(stateName)!;

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

  // Setup all click handlers
  el.querySelectorAll("[g-click]").forEach((clickEl) => {
    if (clickEl instanceof HTMLElement) {
      setupClickHandler(clickEl);
    }
  });

  // Setup all action handlers
  el.querySelectorAll("[g-action]").forEach((actionEl) => {
    if (actionEl instanceof HTMLElement) {
      setupActionHandler(actionEl);
    }
  });

  // Store cleanup function
  const cleanup = () => {
    handlers.forEach((handler, element) => {
      element.removeEventListener("click", handler);
    });
    handlers.clear();
  };

  // Store cleanup function on element
  el.$cleanup = cleanup;
}

function updateElement(el: GrainElement) {
  // Update the element itself first
  updateElementContent(el);

  // Then update all child elements with directives
  DIRECTIVES.forEach((directive) => {
    el.querySelectorAll(`[${directive}]`).forEach((child) => {
      if (child instanceof HTMLElement) {
        updateElementContent(child);
      }
    });
  });
}

function updateElementContent(el: HTMLElement) {
  // Handle text directive first if present
  if (el.hasAttribute("g-text")) {
    handleTextDirective(el, el.getAttribute("g-text")!);
    return;
  }

  // Handle other directives
  DIRECTIVES.forEach((directive) => {
    if (directive !== "g-text" && el.hasAttribute(directive)) {
      const value = el.getAttribute(directive)!;

      if (directive === "g-class") {
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
        handleShowDirective(el, value);
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
        const currentState = deepClone(el.$grain);
        Object.assign(el.$grain, newState);
        history.past.push(currentState);
        if (history.past.length > MAX_HISTORY) {
          history.past.shift();
        }
        history.future = [];
        updateElement(el);
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
  };

  // Handle both sync and async functions
  const result = updates ? func(context, updates) : func(context, args);
  return Promise.resolve(result);
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
