// src/directives/base.ts
import { DIRECTIVES } from "../constants";
import { DirectiveHandler } from "../types";
import { handleAttrDirective } from "./attr";
import { handleClassDirective } from "./class";
import { handleDisabledDirective } from "./disabled";
import { handleModelDirective } from "./model";
import { handleShowDirective } from "./show";
import { handleTextDirective } from "./text";

// Map of directive names to their handlers
const directiveHandlers: Record<string, DirectiveHandler> = {
  "g-text": handleTextDirective,
  "g-show": handleShowDirective,
  "g-disabled": handleDisabledDirective,
  "g-class": handleClassDirective,
  "g-attr": handleAttrDirective,
  "g-model": handleModelDirective,
};

export function updateElementContent(el: HTMLElement) {
  // Process directives in order of priority
  for (const directive of DIRECTIVES) {
    if (el.hasAttribute(directive)) {
      const value = el.getAttribute(directive)!;
      const handler = directiveHandlers[directive];

      if (handler) {
        handler(el, value);
      }
    }
  }
}
