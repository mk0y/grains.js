import { DIRECTIVE_SELECTORS } from "./constants";

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
