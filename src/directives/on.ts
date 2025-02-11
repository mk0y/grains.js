import { findClosestGrainElement } from "../utils/utils";
import { GrainElement } from "../types";
import { callGrainFunction } from "../core/function";

export function handleOnDirective(el: HTMLElement, directiveValue: string) {
  console.log("Setting up event handler:", {
    element: el,
    directive: directiveValue,
  });

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
    console.log("Event triggered:", {
      eventName: actualEventName,
      expression: handlerExpression,
    });

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
      console.log("Parsed function details:", {
        functionName,
        argsString,
        functionExists: !!window[functionName],
      });

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

      console.log("Calling function with:", { functionName, args });

      // Call the function
      await callGrainFunction(grainEl, functionName, undefined, args);
    } catch (error) {
      console.error("Error in event handler:", error);
    }
  });
}
