// src/directives/class.ts
import { findClosestGrainElement } from "../utils";
import { evaluateExpression } from "../core/expressions";

function parseClassExpression(value: string): string[] | null {
  try {
    // Handle simple string class
    if (!value.startsWith("[")) {
      return [value.trim()];
    }

    // Handle array syntax
    const arrayContent = value.slice(1, -1).trim();
    return arrayContent.split(",").map((expr) => expr.trim());
  } catch (error) {
    console.error("[Grains.js] Error parsing class expression:", error);
    return null;
  }
}

function evaluateClassCondition(
  element: HTMLElement,
  expression: string,
): boolean | string | null {
  try {
    // First, check if it's a simple class name (no special characters)
    if (/^[a-zA-Z0-9-_]+$/.test(expression)) {
      return expression;
    }

    // Handle quoted string literals (like 'base' or "base")
    if (expression.match(/^['"].*['"]$/)) {
      return expression.slice(1, -1);
    }

    // Handle conditional expressions
    if (expression.includes("&&")) {
      const [condition, className] = expression
        .split("&&")
        .map((part) => part.trim());
      const result = evaluateExpression(element, condition);
      return result ? className.replace(/['"]/g, "") : false;
    }

    // Try evaluating as expression
    const result = evaluateExpression(element, expression);
    return result ? expression : false;
  } catch (error) {
    console.error("[Grains.js] Error evaluating class condition:", error);
    return null;
  }
}

export function handleClassDirective(element: HTMLElement): void {
  const grainElement = findClosestGrainElement(element);
  if (!grainElement) {
    console.warn(
      "No parent grain element found for g-class directive:",
      element,
    );
    return;
  }

  updateClassDirective(element);
}

export function updateClassDirective(element: HTMLElement): void {
  const classDirective = element.getAttribute("g-class");
  if (!classDirective) return;

  const expressions = parseClassExpression(classDirective);
  if (!expressions) return;

  expressions.forEach((expr) => {
    const result = evaluateClassCondition(element, expr);
    if (typeof result === "string") {
      element.classList.add(result);
    } else if (result === false) {
      // Extract class name from expression and remove it
      const className = expr.split("&&")[1]?.trim().replace(/['"]/g, "");
      if (className) {
        element.classList.remove(className);
      }
    }
  });
}
