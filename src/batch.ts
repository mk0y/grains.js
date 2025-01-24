// Batch update mechanism for DOM updates
let updateQueue = new Set<HTMLElement>();
let updateScheduled = false;

export function scheduleUpdate(
  el: HTMLElement,
  updateFn: (el: HTMLElement) => void
) {
  updateQueue.add(el);
  if (!updateScheduled) {
    updateScheduled = true;
    requestAnimationFrame(() => {
      const elements = Array.from(updateQueue);
      updateQueue.clear();
      updateScheduled = false;
      elements.forEach(updateFn);
    });
  }
}
