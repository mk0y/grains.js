import { findClosestGrainElement, getValueAtPath } from "../utils";

// Formats:
// <div g-text="count"></div>
// <div g-text="f('Count is ${count}')"></div>
export function handleTextDirective(el: HTMLElement, value: string): void {
  const pathOrExpression = value.trim();
  const grainEl = findClosestGrainElement(el);

  if (grainEl && grainEl.$grain) {
    const textValue = getValueAtPath(grainEl.$grain, pathOrExpression);
    if (hasExpression(pathOrExpression)) {
      try {
        // Extract the content inside f('...')
        const match = pathOrExpression.match(/^f\(['"](.+?)['"]\)$/);
        const templateString = match ? match[1] : "";

        // Convert it into an executable template literal
        const formattedString = new Function(
          ...Object.keys(grainEl.$grain),
          `return \`${templateString}\`;`,
        )(...Object.values(grainEl.$grain));

        el.textContent = formattedString;
      } catch (e) {
        console.error("Error evaluating g-text:", e);
      }
    } else {
      // Convert any value to string, handling null/undefined/numbers/etc.
      el.textContent =
        textValue === null || textValue === undefined ? "" : String(textValue);
    }
  } else {
    // Clear text content if no grain element or state is found
    el.textContent = "";
  }
}

function hasExpression(value: string): boolean {
  const regex = /^f\(['"](.+?)['"]\)$/;
  return regex.test(value);
}
