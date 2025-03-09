// src/directives/model.ts
import { updateElement } from "../batcher";
import { observe } from "../core/observe";
import { findClosestGrainElement, setValueAtPath } from "../utils";

function isInputElement(element: HTMLElement): element is HTMLInputElement {
  return element instanceof HTMLInputElement;
}

function isTextAreaElement(
  element: HTMLElement
): element is HTMLTextAreaElement {
  return element instanceof HTMLTextAreaElement;
}

function isSelectElement(element: HTMLElement): element is HTMLSelectElement {
  return element instanceof HTMLSelectElement;
}

export function handleModelDirective(element: HTMLElement, value: string) {
  const grainElement = findClosestGrainElement(element);
  if (!grainElement) {
    return;
  }

  const path = value;

  // Initial value sync
  const initialValue = grainElement.$grain[path];
  if (isInputElement(element)) {
    if (element.type === "checkbox") {
      element.checked = initialValue ?? false;
    } else {
      element.value = initialValue ?? "";
    }
  } else if (isTextAreaElement(element) || isSelectElement(element)) {
    element.value = initialValue ?? "";
  }

  // Set up event listener for changes
  const handleInput = () => {
    if (isInputElement(element)) {
      if (element.type === "checkbox") {
        setValueAtPath(grainElement.$grain, path, element.checked);
      } else {
        setValueAtPath(grainElement.$grain, path, element.value);
      }
    } else if (isTextAreaElement(element) || isSelectElement(element)) {
      setValueAtPath(grainElement.$grain, path, element.value);
    }
    updateElement(grainElement);
  };
  if (isSelectElement(element)) {
    element.addEventListener("change", handleInput);
  } else {
    element.addEventListener("input", handleInput);
  }

  // Set up observer
  const updateElementValue = () => {
    if (isInputElement(element)) {
      if (element.type === "checkbox") {
        element.checked = grainElement.$grain[path] ?? false;
      } else {
        element.value = grainElement.$grain[path] ?? "";
      }
    } else if (isTextAreaElement(element) || isSelectElement(element)) {
      element.value = grainElement.$grain[path] ?? "";
    }
  };
  observe(grainElement.$grain, updateElementValue);

  // Cleanup handler
  grainElement.$cleanup = () => {
    element.removeEventListener("input", handleInput);
    element.removeEventListener("change", handleInput);
  };
}
