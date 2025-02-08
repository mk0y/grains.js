import { GrainElement, ElementCache, updateElementContent } from "./app";

class UpdateBatcher {
  private static pendingUpdates = new Set<GrainElement>();
  private static frameRequested = false;

  static scheduleUpdate(el: GrainElement) {
    this.pendingUpdates.add(el);

    if (!this.frameRequested) {
      this.frameRequested = true;
      requestAnimationFrame(() => this.processUpdates());
    }
  }

  private static processUpdates() {
    // Process all pending updates
    for (const el of this.pendingUpdates) {
      const cache = ElementCache.getCache(el) || ElementCache.cacheElements(el);

      for (const element of cache.allElements) {
        if (element instanceof HTMLElement) {
          updateElementContent(element);
        }
      }
    }

    // Clear the queue
    this.pendingUpdates.clear();
    this.frameRequested = false;
  }

  static forceUpdate(el: GrainElement) {
    const cache = ElementCache.getCache(el) || ElementCache.cacheElements(el);

    for (const element of cache.allElements) {
      if (element instanceof HTMLElement) {
        updateElementContent(element);
      }
    }

    this.pendingUpdates.delete(el);
  }
}

export default UpdateBatcher;
