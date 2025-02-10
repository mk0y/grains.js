// src/constants.ts
export const EVENT_TYPES = [
  "click",
  "submit",
  "change",
  "input",
  "focus",
  "blur",
  "mouseenter",
  "mouseleave",
] as const;

// Create g-on selectors for all supported events
const G_ON_SELECTORS = EVENT_TYPES.map((event) => `[g-on\\:${event}]`).join(
  ", ",
);

export const DIRECTIVE_SELECTORS = {
  STATE: "[g-state]",
  INTERACTIVE: `[g-click], [g-action], ${G_ON_SELECTORS}`,
  DYNAMIC: "[g-text], [g-show], [g-class], [g-disabled]",
  ALL: `[g-state], [g-click], [g-action], [g-text], [g-show], [g-class], [g-disabled], ${G_ON_SELECTORS}`,
};

export const DIRECTIVES = [
  "g-text",
  "g-show",
  "g-disabled",
  "g-class",
  "g-transition",
] as const;

export const MAX_HISTORY = 50;
