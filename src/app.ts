// Grains.js
// A lightweight reactive micro-states management library for HTML

import { DIRECTIVE_SELECTORS } from "./utils/constants";
import { setupGrain } from "./core/setup";
import { store } from "./store";
import { Grain, GrainContext, GrainElement } from "./types";

declare global {
  interface Window {
    [key: string]: any;
  }
}

async function bootstrap() {
  store.clear();

  const grainElements = document.querySelectorAll<HTMLElement>(
    DIRECTIVE_SELECTORS.STATE,
  );

  await Promise.all(
    Array.from(grainElements).map((el) => setupGrain(el as GrainElement)),
  );
}

window.addEventListener("DOMContentLoaded", () => {
  bootstrap().catch((error) => {
    console.error("Failed to bootstrap Grains.js:", error);
  });
});

export { bootstrap, store as grainStore };
export type { Grain, GrainContext, GrainElement };
