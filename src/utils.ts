import diff from "microdiff";
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

export function applyDiff(
  target: Record<string, any>,
  diffs: ReturnType<typeof diff>
): Record<string, any> {
  diffs.forEach((diff) => {
    let current = target;
    const lastKey = diff.path.pop()!;
    diff.path.forEach((key) => {
      if (!current[key]) current[key] = {};
      current = current[key];
    });
    if (diff.type !== "REMOVE") {
      current[lastKey] = diff.value;
    } else {
      delete current[lastKey];
    }
  });
  return target;
}
