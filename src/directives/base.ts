// src/directives/base.ts
import { DIRECTIVES } from "../constants";
import { DirectiveForHandler, DirectiveHandler } from "../types";
import { handleAttrDirective } from "./attr";
import { handleClassDirective } from "./class";
import { handleDisabledDirective } from "./disabled";
import { handleForDirective } from "./for";
import { handleModelDirective } from "./model";
import { handleShowDirective } from "./show";
import { handleTextDirective } from "./text";

// Map of directive names to their handlers
const directiveHandlers: Record<string, DirectiveHandler | DirectiveForHandler> = {
  "g-text": handleTextDirective,
  "g-show": handleShowDirective,
  "g-disabled": handleDisabledDirective,
  "g-class": handleClassDirective,
  "g-attr": handleAttrDirective,
  "g-model": handleModelDirective,
  "g-for": handleForDirective,
};

export function updateElementContent(el: HTMLElement) {
  // Process directives in order of priority
  for (const directive of DIRECTIVES) {
    if (el.hasAttribute(directive)) {
      const value = el.getAttribute(directive)!;
      const handler = directiveHandlers[directive];

      if (handler) {
        if (Array.isArray(value)) {
          (handler as DirectiveForHandler)(el, value);
        } else {
          (handler as DirectiveHandler)(el, value);
        }
      }
    }
  }
}
