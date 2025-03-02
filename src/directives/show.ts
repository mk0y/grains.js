// src/directives/show.ts
import { evaluateExpression } from "../core/expressions";

export function handleShowDirective(el: HTMLElement, expression: string): void {
  // Store the original display value if not already stored.
  if (!("originalDisplay" in el.dataset)) {
    el.dataset.originalDisplay =
      el.style.display || getComputedStyle(el).display;
  }
  const shouldShow = evaluateExpression(el, expression);
  // If the element should be shown, restore the original display; otherwise, hide it.
  el.style.display = shouldShow ? el.dataset.originalDisplay! : "none";
}
