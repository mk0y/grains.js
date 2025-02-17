// src/core/directives/on.ts
import { findClosestGrainElement } from "../utils";
import { callGrainFunction } from "../core/context";
import { VALID_DOM_EVENTS } from "../constants";

export function validateEventName(
  eventName: string,
  element: HTMLElement,
): boolean {
  if (!VALID_DOM_EVENTS.has(eventName)) {
    console.warn(
      `[Grains.js] Invalid event type "${eventName}" in g-on:${eventName}. ` +
        `Element:`,
      element,
      `\nValid events are: ${Array.from(VALID_DOM_EVENTS).join(", ")}`,
    );
    return false;
  }
  return true;
}

export function validateFunctionName(
  funcName: string,
  element: HTMLElement,
): boolean {
  if (!funcName) {
    console.warn(
      "[Grains.js] Empty function name provided for event handler. Element:",
      element,
    );
    return false;
  }

  if (typeof window[funcName] !== "function") {
    console.warn(
      `[Grains.js] Function "${funcName}" not found in global scope. ` +
        `Make sure it's defined before the element. Element:`,
      element,
    );
    return false;
  }

  return true;
}

export function createEventHandler(
  element: HTMLElement,
  eventName: string,
  funcName: string,
): (event: Event) => Promise<void> {
  return async (event: Event) => {
    event.preventDefault();

    let args: any[] = [];
    if (element.hasAttribute("g-args")) {
      try {
        args = JSON.parse(element.getAttribute("g-args")!);
        if (!Array.isArray(args)) {
          throw new Error("g-args must be an array");
        }
      } catch (error) {
        console.error(
          "[Grains.js] Invalid g-args format. Must be a valid JSON array. Element:",
          element,
          "\nError:",
          error,
        );
        return;
      }
    }

    try {
      const grainEl = findClosestGrainElement(element);
      if (!grainEl) {
        console.warn(
          "[Grains.js] No parent grain element found. Event handler cannot be executed. Element:",
          element,
        );
        return;
      }
      await callGrainFunction(grainEl, funcName, undefined, args);
    } catch (error) {
      console.error(
        `[Grains.js] Error in ${eventName} handler "${funcName}":`,
        error,
        "\nElement:",
        element,
      );
    }
  };
}

// export function setupOnDirective(
//   element: HTMLElement,
//   handlers: Map<HTMLElement, Map<string, (event: Event) => void>>,
// ) {
//   Array.from(element.attributes).forEach((attr) => {
//     if (attr.name.startsWith("g-on:")) {
//       const eventName = attr.name.split("g-on:")[1];
//       const funcName = attr.value;

//       if (
//         validateEventName(eventName, element) &&
//         validateFunctionName(funcName, element)
//       ) {
//         const handler = createEventHandler(element, eventName, funcName);
//         element.addEventListener(eventName, handler);

//         if (!handlers.has(element)) {
//           handlers.set(element, new Map());
//         }
//         handlers.get(element)!.set(eventName, handler);
//       }
//     }
//   });
// }
export function setupOnDirective(
  element: HTMLElement,
  handlers: Map<HTMLElement, Map<string, (event: Event) => void>>,
) {
  Array.from(element.attributes).forEach((attr) => {
    if (attr.name.startsWith("g-on:")) {
      const eventName = attr.name.split("g-on:")[1];
      const funcName = attr.value;

      // Validate event name first
      if (!VALID_DOM_EVENTS.has(eventName)) {
        console.warn(
          `[Grains.js] Invalid event type "${eventName}" in g-on:${eventName}. Element:`,
          element,
          `\nValid events are: ${Array.from(VALID_DOM_EVENTS).join(", ")}`,
        );
        return; // Skip invalid events
      }

      // Then validate function name
      if (!validateFunctionName(funcName, element)) {
        return; // Skip invalid functions
      }

      const handler = createEventHandler(element, eventName, funcName);
      element.addEventListener(eventName, handler);

      if (!handlers.has(element)) {
        handlers.set(element, new Map());
      }
      handlers.get(element)!.set(eventName, handler);
    }
  });
}
