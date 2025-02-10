// src/directives/show.ts
import { evaluateExpression } from "../core/expressions";
import { transition } from "./transition";

export function handleShowDirective(el: HTMLElement, value: string) {
  const show = evaluateExpression(el, value);
  const transitionName = el.getAttribute("g-transition");

  if (transitionName) {
    el.style.visibility = show ? "visible" : "hidden";
    transition(el, show, transitionName as any);
  } else {
    el.style.display = show ? "" : "none";
  }
}
