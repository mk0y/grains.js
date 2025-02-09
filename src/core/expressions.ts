// src/core/expressions.ts
import { findClosestGrainElement } from "../utils";
import { UTILITY_FUNCTIONS } from "../utility-functions";
import { GrainElement } from "../types";

type ExpressionArgument = string | number;

export function evaluateExpression(
  el: HTMLElement,
  expression: string,
): boolean {
  const grainEl = findClosestGrainElement(el);
  if (!grainEl) return false;

  try {
    // Replace utility function calls with their results
    const resolvedExpression = expression.replace(
      /(\w+)\((.*?)\)/g,
      (match, funcName, argsStr) => {
        if (funcName in UTILITY_FUNCTIONS) {
          const args: ExpressionArgument[] = argsStr
            .split(",")
            .map((arg: string) => {
              arg = arg.trim();
              if (arg.startsWith("'") || arg.startsWith('"')) {
                return arg.slice(1, -1);
              }
              if (!isNaN(Number(arg))) {
                return Number(arg);
              }
              return arg;
            });
          return UTILITY_FUNCTIONS[funcName](grainEl, ...args).toString();
        }
        return match;
      },
    );

    const context = createExpressionContext(grainEl);

    return Function(
      ...Object.keys(context),
      `return ${resolvedExpression}`,
    )(...Object.values(context));
  } catch (error) {
    console.error(`Error evaluating expression "${expression}":`, error);
    return false;
  }
}

function createExpressionContext(el: GrainElement): Record<string, any> {
  return el.$grain;
}
