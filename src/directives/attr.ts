// src/directives/attr.ts
import { findClosestGrainElement } from "../utils";
import { evaluateExpression } from "../core/expressions";
import { resolvePlaceholders } from "../core/placeholders";
import { GrainElement } from "../types";

interface AttrBinding {
  attr: string;
  expression: string;
}

const ATTR_SEPARATOR = ",";
const ATTR_VALUE_SEPARATOR = ":";
const BOOLEAN_ATTRIBUTES = new Set([
  "disabled",
  "checked",
  "readonly",
  "required",
  "hidden",
  "selected",
  "multiple",
  "novalidate",
]);

// List of valid HTML attributes for validation
const VALID_HTML_ATTRIBUTES = new Set([
  "src",
  "href",
  "alt",
  "title",
  "class",
  "id",
  "name",
  "value",
  "type",
  "placeholder",
  "disabled",
  "checked",
  "readonly",
  "required",
  "aria-label",
  "aria-describedby",
  "role",
  "style",
  "data-*",
  // Add more as needed
]);

function validateAttrBinding(
  attr: string,
  expression: string,
  element: HTMLElement,
): boolean {
  // Check if attribute name is empty
  if (!attr) {
    console.warn("Empty attribute name in g-attr directive:", element);
    return false;
  }

  // Check if expression is empty
  if (!expression) {
    console.warn(
      `Empty expression for attribute "${attr}" in g-attr directive:`,
      element,
    );
    return false;
  }

  // Validate attribute name format
  if (
    !/^[a-zA-Z0-9\-_]+$/.test(attr) &&
    !attr.startsWith("data-") &&
    !attr.startsWith("aria-")
  ) {
    console.warn(
      `Invalid attribute name "${attr}" in g-attr directive. Use only letters, numbers, hyphens, and underscores:`,
      element,
    );
    return false;
  }

  // Check if it's a valid HTML attribute
  if (
    !VALID_HTML_ATTRIBUTES.has(attr) &&
    !attr.startsWith("data-") &&
    !attr.startsWith("aria-")
  ) {
    console.warn(
      `Potentially invalid HTML attribute "${attr}" in g-attr directive:`,
      element,
    );
    // Don't return false here, just warn as it might be a custom attribute
  }

  // Basic expression syntax validation
  if (expression.includes("{")) {
    if (!expression.includes("}")) {
      console.warn(
        `Unclosed placeholder in expression "${expression}" for attribute "${attr}":`,
        element,
      );
      return false;
    }
  }

  return true;
}

function parseAttrBindings(
  directive: string,
  element: HTMLElement,
): AttrBinding[] {
  if (!directive.includes(ATTR_VALUE_SEPARATOR)) {
    console.warn(
      'Invalid g-attr syntax. Use "attribute: expression" format:',
      element,
    );
    return [];
  }

  return directive
    .split(ATTR_SEPARATOR)
    .map((binding) => binding.trim())
    .filter((binding) => binding.includes(ATTR_VALUE_SEPARATOR))
    .map((binding) => {
      const [attr, ...exprParts] = binding.split(ATTR_VALUE_SEPARATOR);
      const expression = exprParts.join(ATTR_VALUE_SEPARATOR).trim();

      return {
        attr: attr.trim(),
        expression,
      };
    })
    .filter(({ attr, expression }) =>
      validateAttrBinding(attr, expression, element),
    );
}

function updateAttributes(
  element: HTMLElement,
  bindings: AttrBinding[],
  grainElement: GrainElement,
): void {
  bindings.forEach(({ attr, expression }) => {
    try {
      let value: any;

      // If it's a simple state reference like {imageUrl}
      if (expression.startsWith("{") && expression.endsWith("}")) {
        // Extract the expression from within curly braces
        const innerExpression = expression.slice(1, -1);

        if (
          !innerExpression.includes("<") &&
          !innerExpression.includes(">") &&
          !innerExpression.includes("&&") &&
          !innerExpression.includes("||")
        ) {
          // Simple state reference
          value = resolvePlaceholders(grainElement, expression).replace(
            /^"(.*)"$/,
            "$1",
          );
          // Convert string values to their proper types
          if (value === "true") value = true;
          if (value === "false") value = false;
          if (value === "null") value = null;
          if (value === "undefined") value = undefined;
        } else {
          // Complex expression
          value = evaluateExpression(element, innerExpression);
        }
      } else {
        value = evaluateExpression(element, expression);
      }

      const attrLower = attr.toLowerCase();

      if (BOOLEAN_ATTRIBUTES.has(attrLower)) {
        const boolValue = Boolean(value) === true;
        if (boolValue) {
          element.setAttribute(attr, "");
        } else {
          element.removeAttribute(attr);
        }
        return;
      }

      if (
        value === null ||
        value === undefined ||
        value === "null" ||
        value === "undefined"
      ) {
        element.removeAttribute(attr);
      } else {
        element.setAttribute(attr, String(value));
      }
    } catch (error) {
      console.error(`Error updating attribute "${attr}":`, error);
    }
  });
}

export function handleAttrDirective(element: HTMLElement, value: string): void {
  const grainElement = findClosestGrainElement(element);
  if (!grainElement) {
    console.warn(
      "No parent grain element found for g-attr directive:",
      element,
    );
    return;
  }

  const bindings = parseAttrBindings(value, element);
  updateAttributes(element, bindings, grainElement);
}

export function updateAttrDirective(
  element: HTMLElement,
  grainElement: GrainElement,
): void {
  const attrDirective = element.getAttribute("g-attr");
  if (!attrDirective) return;

  const bindings = parseAttrBindings(attrDirective, element);
  updateAttributes(element, bindings, grainElement);
}
