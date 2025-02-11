// src/directives/attr.ts
import { findClosestGrainElement, getValueAtPath } from "../utils/utils";

export function handleAttrDirective(el: HTMLElement, value: string) {
  // Split the directive value to get attribute name and path
  // For "src:state.something.else", attributeName will be "src"
  const [attributeName, ...pathParts] = value.split(":");
  // Join the remaining parts to get the full path
  const path = pathParts.join(":").trim();

  const grainEl = findClosestGrainElement(el);

  if (grainEl && grainEl.$grain) {
    // Get the value from the state using the path
    const attrValue = getValueAtPath(grainEl.$grain, path);
    el.setAttribute(attributeName, String(attrValue));
  }
}
