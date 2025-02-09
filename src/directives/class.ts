// src/directives/class.ts
import { evaluateExpression } from "../core/expressions";
import { GrainElement } from "../types";
import { resolvePlaceholders } from "../core/placeholders";

export function handleClassDirective(el: HTMLElement, value: string): void {
  try {
    const expr = resolvePlaceholders(el as GrainElement, value);
    const result = Function(`return ${expr}`)();

    if (typeof result === "string") {
      // Handle string class names
      el.className = result;
    } else if (typeof result === "object") {
      // Handle object of class toggles
      Object.entries(result).forEach(([className, condition]) => {
        if (typeof condition === "string") {
          // Handle expressions in class conditions
          el.classList.toggle(className, evaluateExpression(el, condition));
        } else {
          el.classList.toggle(className, !!condition);
        }
      });
    }
  } catch (error) {
    console.error(`Error handling class directive:`, error);
  }
}
