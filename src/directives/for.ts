// <div g-for="item in items" g-text="item.name"></div>

import { findClosestGrainElement } from "../utils";

const validateLoopExpression = (expression: string) => {
  const [item, arrayName] = expression.split(" in ");
  if (!item || !arrayName) {
    console.warn("Invalid g-for expression:", expression);
    return "";
  }
  return arrayName;
};

// This function handles the g-for directive
// It takes an HTMLElement and an array of items as arguments
// It will create a new element for each item in the array
// and apply the g-text directive to each element
// It will replace the original element with the new elements
export function handleForDirective(el: HTMLElement) {
  // First evaluate the expression "item in items"
  // Then apply the textContent to each element
  const grainElement = findClosestGrainElement(el);
  if (!grainElement) {
    console.warn("No grain element found");
    return;
  }
  const loopDirective = el.getAttribute("g-for");
  if (!loopDirective) return;

  if (el.hasAttribute("g-for")) {
    const arrayName = validateLoopExpression(loopDirective);
    const initialValue = grainElement.$grain[arrayName] || window[arrayName];
    const newElements = initialValue.map((item: string | null) => {
      const newEl = el.cloneNode(true) as HTMLElement;
      newEl.textContent = item;
      return newEl;
    });
    el.replaceWith(...newElements);
  }
}
