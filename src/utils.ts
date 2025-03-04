import diff from "microdiff";
import rfdc from "rfdc";
import type { GrainElement } from "./app";

const clone = rfdc();

export function deepClone<T>(obj: T): T {
  return clone(obj);
}

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

// export function getValueAtPath(obj: any, path: string): any {
//   return path.split(".").reduce((o, i) => (o ? o[i] : undefined), obj);
// }
export function getValueAtPath(obj: any, path: string): any {
  if (!obj || typeof path !== "string" || path.length === 0) {
    return undefined;
  }
  const pathSegments = path.split(".");
  let current = obj;
  for (const segment of pathSegments) {
    if (
      current === null ||
      current === undefined ||
      !current.hasOwnProperty(segment)
    ) {
      return undefined;
    }
    current = current[segment];
  }
  return current;
}

export function setValueAtPath(obj: any, path: string, value: any): void {
  if (!obj || typeof path !== "string" || path.length === 0) {
    return;
  }
  const pathSegments = path.split(".");
  let current = obj;
  for (let i = 0; i < pathSegments.length - 1; i++) {
    const segment = pathSegments[i];
    if (!current.hasOwnProperty(segment)) {
      current[segment] = {};
    }
    current = current[segment];
  }
  current[pathSegments[pathSegments.length - 1]] = value;
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
