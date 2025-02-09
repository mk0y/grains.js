// src/directives/show.ts
import { evaluateExpression } from "../core/expressions";

export function handleShowDirective(el: HTMLElement, expression: string): void {
  el.style.display = evaluateExpression(el, expression) ? "" : "none";
}
