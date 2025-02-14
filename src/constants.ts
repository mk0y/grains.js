// src/constants.ts
export const DIRECTIVE_SELECTORS = {
  STATE: "[g-state]",
  INTERACTIVE: "[g-click], [g-action]",
  DYNAMIC: "[g-text], [g-show], [g-class], [g-disabled], [g-attr]",
  // ALL: "[g-state], [g-click], [g-action], [g-text], [g-show], [g-class], [g-disabled], [g-attr]",
  get ALL() {
    return `${this.STATE},${this.INTERACTIVE},${this.DYNAMIC}`;
  },
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
  "g-attr",
] as const;

export const MAX_HISTORY = 50;
