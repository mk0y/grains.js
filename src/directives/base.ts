import { handleTextDirective } from "./text";
import { handleShowDirective } from "./show";
import { updateDisabledState } from "./disabled";
import { DIRECTIVES } from "../constants";
import { GrainElement } from "../types";
import { findClosestGrainElement } from "../utils";
import { updateClasses } from "./class";

export function updateElementContent(el: HTMLElement) {
  if (el.hasAttribute("g-text")) {
    handleTextDirective(el, el.getAttribute("g-text")!);
    return;
  }

  for (const directive of DIRECTIVES) {
    if (directive !== "g-text" && el.hasAttribute(directive)) {
      const value = el.getAttribute(directive)!;

      if (directive === "g-class") {
        updateClasses(el as GrainElement, value);
      } else if (directive === "g-disabled") {
        const grainEl = findClosestGrainElement(el);
        if (grainEl && el instanceof HTMLButtonElement) {
          const action = el.getAttribute("g-action");
          if (action === "undo" || action === "redo") {
            const stateName = grainEl.getAttribute("g-state")!.split(":")[0];
            updateDisabledState(el, stateName);
          }
        }
      } else if (directive === "g-show") {
        handleShowDirective(el, value);
      }
    }
  }
}
