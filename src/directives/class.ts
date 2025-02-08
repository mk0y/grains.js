import { GrainElement } from "../types";
import { resolvePlaceholders } from "../core/placeholders";

// src/directives/class.ts
export function updateClasses(el: GrainElement, value: string) {
  try {
    const expr = resolvePlaceholders(el, value);
    const result = Function(`return ${expr}`)();

    if (typeof result === "string") {
      el.className = result;
    } else if (typeof result === "object") {
      for (const [className, active] of Object.entries(result)) {
        el.classList.toggle(className, !!active);
      }
    }
  } catch (error) {
    console.error("Error updating classes:", error);
  }
}
