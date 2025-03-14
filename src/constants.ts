// src/constants.ts
export const VALID_DOM_EVENTS = new Set([
  "click",
  "mouseover",
  "mouseout",
  "mouseenter",
  "mouseleave",
  "submit",
  "change",
  "input",
  "focus",
  "blur",
  "keyup",
  "keydown",
  "keypress",
  "scroll",
  "resize",
  "load",
  "unload",
  "beforeunload",
]);

// Generate event selectors
const EVENT_SELECTORS = Array.from(VALID_DOM_EVENTS)
  .map((event) => `[g-on\\:${event}]`)
  .join(", ");

export const DIRECTIVE_SELECTORS = {
  STATE: "[g-state]",
  INTERACTIVE: `${EVENT_SELECTORS}, [g-action]`,
  DYNAMIC: "[g-text], [g-show], [g-class], [g-disabled], [g-attr], [g-model], [g-for]",
  get ALL() {
    return `${this.STATE},${this.INTERACTIVE},${this.DYNAMIC}`;
  },
};

export const DIRECTIVES = [
  "g-state",
  "g-init",
  "g-text",
  "g-class",
  "g-action",
  "g-args",
  "g-disabled",
  "g-show",
  "g-attr",
  "g-model",
  "g-for",
] as const;

export const MAX_HISTORY = 50;
