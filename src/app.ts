// Grains.js
// A lightweight reactive micro-states management library for HTML

import rfdc from "rfdc";
import { handleShowDirective } from "./directives/show";
import { handleTextDirective } from "./directives/text";
import { findClosestGrainElement, getValueAtPath } from "./utils";
import UpdateBatcher from "./batcher";

// Types
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

declare global {
  interface Window {
    [key: string]: any;
  }
}

// Constants
const clone = rfdc();
const DIRECTIVE_SELECTORS = {
  STATE: "[g-state]",
  INTERACTIVE: "[g-click], [g-action]",
  DYNAMIC: "[g-text], [g-show], [g-class], [g-disabled]",
  ALL: "[g-state], [g-click], [g-action], [g-text], [g-show], [g-class], [g-disabled]",
};

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

const MAX_HISTORY = 50;

// Store
class GrainStore {
  private grains = new Map<string, Grain>();
  private history = new Map<string, GrainHistory>();

  clear() {
    this.grains.clear();
    this.history.clear();
  }

  set(name: string, grain: Grain) {
    this.grains.set(name, grain);
  }

  get(name: string) {
    return this.grains.get(name);
  }

  delete(name: string) {
    this.grains.delete(name);
    this.history.delete(name);
  }

  getHistory(name: string) {
    return this.history.get(name);
  }

  initHistory(name: string) {
    this.history.set(name, { past: [], future: [] });
  }
}

const store = new GrainStore();

// Cache
export class ElementCache {
  private static cache = new WeakMap<
    HTMLElement,
    {
      textElements: HTMLElement[];
      showElements: HTMLElement[];
      interactiveElements: HTMLElement[];
      allElements: HTMLElement[];
    }
  >();

  static cacheElements(rootEl: HTMLElement) {
    const cached = {
      textElements: Array.from(
        rootEl.querySelectorAll<HTMLElement>("[g-text]"),
      ),
      showElements: Array.from(
        rootEl.querySelectorAll<HTMLElement>("[g-show]"),
      ),
      interactiveElements: Array.from(
        rootEl.querySelectorAll<HTMLElement>(DIRECTIVE_SELECTORS.INTERACTIVE),
      ),
      allElements: Array.from(
        rootEl.querySelectorAll<HTMLElement>(DIRECTIVE_SELECTORS.ALL),
      ),
    };

    this.cache.set(rootEl, cached);
    return cached;
  }

  static getCache(rootEl: HTMLElement) {
    return this.cache.get(rootEl);
  }

  static clearCache(rootEl: HTMLElement) {
    this.cache.delete(rootEl);
  }
}

function deepClone<T>(obj: T): T {
  return clone(obj);
}

function bootstrap() {
  store.clear();

  const grainElements = document.querySelectorAll<HTMLElement>(
    DIRECTIVE_SELECTORS.STATE,
  );
  for (const el of grainElements) {
    setupGrain(el as GrainElement);
  }
}

function observe<T extends object>(obj: T, callback: () => void): T {
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
        requestAnimationFrame(() => callback());
      }

      return result;
    },

    deleteProperty(target: T, property: string | symbol): boolean {
      const hadProperty = property in target;
      const result = Reflect.deleteProperty(target, property);

      if (hadProperty) {
        requestAnimationFrame(() => callback());
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

function setupEventListeners(el: GrainElement) {
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

function updateElement(el: GrainElement) {
  UpdateBatcher.scheduleUpdate(el);
}

export function updateElementContent(el: HTMLElement) {
  if (el.hasAttribute("g-text")) {
    handleTextDirective(el, el.getAttribute("g-text")!);
    return;
  }

  for (const directive of DIRECTIVES) {
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
            const history = store.getHistory(stateName)!;
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
  }
}

function updateClasses(el: GrainElement, value: string) {
  try {
    const expr = resolvePlaceholders(el, value);
    const result = Function(`return ${expr}`)();

    if (typeof result === "string") {
      el.className = result;
    } else if (typeof result === "object") {
      for (const [className, active] of Object.entries(result)) {
        el.classList.toggle(className, !!active);
      }
    }
  } catch (error) {
    console.error("Error updating classes:", error);
  }
}

function resolvePlaceholders(el: GrainElement, str: string): string {
  return str.replace(/\{([^}]+)\}/g, (_, path) =>
    JSON.stringify(getValueAtPath(el.$grain, path)),
  );
}

function callGrainFunction(
  el: GrainElement,
  funcName: string,
  updates?: Grain,
  args: any[] = [],
): Promise<void> {
  const func = window[funcName];
  if (typeof func !== "function") {
    throw new Error(`Function '${funcName}' not defined`);
  }

  const stateName = el.getAttribute("g-state")!.split(":")[0];
  const history = store.getHistory(stateName)!;

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
        UpdateBatcher.scheduleUpdate(el);
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

  const result = updates ? func(context, updates) : func(context, args);
  return Promise.resolve(result);
}

window.addEventListener("DOMContentLoaded", bootstrap);
export {
  bootstrap,
  findClosestGrainElement,
  store as grainStore,
  setupGrain,
  updateElement,
};
export type { Grain, GrainContext, GrainElement };
