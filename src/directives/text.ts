import { findClosestGrainElement, getValueAtPath } from "../utils";

export function handleTextDirective(el: HTMLElement, value: string): void {
  const path = value.replace(/[{}]/g, "").trim();
  const grainEl = findClosestGrainElement(el);
  if (grainEl) {
    const textValue = getValueAtPath(grainEl.$grain, path);
    el.textContent = textValue !== undefined ? String(textValue) : "";
  }
}
