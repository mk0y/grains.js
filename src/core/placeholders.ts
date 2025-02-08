// src/core/placeholders.ts
import { GrainElement } from "../types";
import { getValueAtPath } from "../utils";

export function resolvePlaceholders(el: GrainElement, str: string): string {
  return str.replace(/\{([^}]+)\}/g, (_, path) =>
    JSON.stringify(getValueAtPath(el.$grain, path)),
  );
}
