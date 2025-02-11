// src/directives/show.ts
import { evaluateExpression } from "../core/expressions";

export function handleShowDirective(el: HTMLElement, value: string) {
  const show = evaluateExpression(el, value);
  el.style.display = show ? "" : "none";
}
