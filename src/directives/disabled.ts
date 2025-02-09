// src/directives/disabled.ts
import { evaluateExpression } from "../core/expressions";

export function handleDisabledDirective(
  el: HTMLElement,
  expression: string,
): void {
  if (el instanceof HTMLButtonElement) {
    el.disabled = evaluateExpression(el, expression);
  }
}
