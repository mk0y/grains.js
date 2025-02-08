import { getValueAtPath } from "../utils";

import { findClosestGrainElement } from "../utils";

export function handleShowDirective(el: HTMLElement, value: string): void {
  console.log("handleShowDirective", el, value);
  const grainEl = findClosestGrainElement(el);
  if (grainEl) {
    try {
      const [prop, op, compareValue] = value.split(/\s+/);
      const stateValue = getValueAtPath(grainEl.$grain, prop);
      const parsedCompareValue = JSON.parse(compareValue);
      // console.log(stateValue, parsedCompareValue);
      let show = false;

      switch (op) {
        case "==":
          show = stateValue == parsedCompareValue;
          break;
        case "===":
          show = stateValue === parsedCompareValue;
          break;
        case "!=":
          show = stateValue != parsedCompareValue;
          break;
        case "!==":
          show = stateValue !== parsedCompareValue;
          break;
        case ">":
          show = stateValue > parsedCompareValue;
          break;
        case ">=":
          show = stateValue >= parsedCompareValue;
          break;
        case "<":
          show = stateValue < parsedCompareValue;
          break;
        case "<=":
          show = stateValue <= parsedCompareValue;
          break;
        default:
          console.error(`Unsupported operator: ${op}`);
      }

      el.style.display = show ? "" : "none";
    } catch (error) {
      console.error("Error evaluating g-show:", error);
    }
  }
}
