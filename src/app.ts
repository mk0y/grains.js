// Grains.js
// A lightweight reactive micro-states management library for HTML

import { DIRECTIVE_SELECTORS } from "./constants";
import { setupGrain } from "./core/setup";
import { store } from "./store";
import { Grain, GrainContext, GrainElement } from "./types";

declare global {
  interface Window {
    [key: string]: any;
  }
}

function bootstrap() {
  store.clear();

  const grainElements = document.querySelectorAll<HTMLElement>(
    DIRECTIVE_SELECTORS.STATE,
  );
  for (const el of grainElements) {
    setupGrain(el as GrainElement);
  }
}

window.addEventListener("DOMContentLoaded", bootstrap);

export { bootstrap, store as grainStore };
export type { Grain, GrainContext, GrainElement };
