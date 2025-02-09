// src/constants.ts
export const DIRECTIVE_SELECTORS = {
  STATE: "[g-state]",
  INTERACTIVE: "[g-click], [g-action]",
  DYNAMIC: "[g-text], [g-show], [g-class], [g-disabled]",
  ALL: "[g-state], [g-click], [g-action], [g-text], [g-show], [g-class], [g-disabled]",
};

export const DIRECTIVES = [
  "g-state",
  "g-init",
  "g-text",
  "g-class",
  "g-click",
  "g-action",
  "g-args",
  "g-disabled",
  "g-show",
] as const;

export const MAX_HISTORY = 50;
