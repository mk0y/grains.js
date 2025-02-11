import { findClosestGrainElement } from "../utils/utils";
import { GrainElement } from "../types";
import { callGrainFunction } from "../core/function";

export function handleOnDirective(el: HTMLElement, directiveValue: string) {
  // Parse the directive value
  const [eventName, handlerExpression] = directiveValue.split(":");
  const actualEventName = eventName || "click";

  // Find the grain element
  const grainEl = findClosestGrainElement(el) as GrainElement;

  if (!grainEl || !handlerExpression) {
    console.warn("Missing required elements:", { grainEl, handlerExpression });
    return;
  }

  // Set up the event listener
  el.addEventListener(actualEventName, async (event) => {
    event.preventDefault();

    try {
      // Parse the handler expression
      const cleanExpression = handlerExpression.trim();
      const functionNameMatch = cleanExpression.match(/^(\w+)(?:\((.*)\))?$/);

      if (!functionNameMatch) {
        console.error("Invalid handler expression:", cleanExpression);
        return;
      }

      const [, functionName, argsString] = functionNameMatch;
      // Parse arguments
      let args: any[] = [];
      if (argsString) {
        args = argsString.split(",").map((arg) => {
          arg = arg.trim();
          // Remove quotes from string arguments
          if (arg.match(/^['"].*['"]$/)) {
            return arg.slice(1, -1);
          }
          // Convert numbers if possible
          const num = Number(arg);
          return isNaN(num) ? arg : num;
        });
      }

      // Call the function
      await callGrainFunction(grainEl, functionName, undefined, args);
    } catch (error) {
      console.error("Error in event handler:", error);
    }
  });
}
