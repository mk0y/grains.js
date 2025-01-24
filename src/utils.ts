import type { GrainElement } from "./app";

export function findClosestGrainElement(el: HTMLElement): GrainElement | null {
  let current: HTMLElement | null = el;
  while (current) {
    if (current.hasAttribute("g-state")) {
      return current as GrainElement;
    }
    current = current.parentElement;
  }
  return null;
}

export function getValueAtPath(obj: any, path: string): any {
  return path.split(".").reduce((o, i) => (o ? o[i] : undefined), obj);
}
