import { findClosestGrainElement, getValueAtPath } from "../utils";

export function handleTextDirective(el: HTMLElement, value: string): void {
  const path = value.replace(/[{}]/g, "").trim();
  const grainEl = findClosestGrainElement(el);

  if (grainEl && grainEl.$grain) {
    const textValue = getValueAtPath(grainEl.$grain, path);
    // Convert any value to string, handling null/undefined/numbers/etc.
    el.textContent =
      textValue === null || textValue === undefined ? "" : String(textValue);
  } else {
    // Clear text content if no grain element or state is found
    el.textContent = "";
  }
}
