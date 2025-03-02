// src/__tests__/directives/show.test.ts
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { bootstrap } from "../../app";

describe("g-show directive", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it("should show element if expression is true and restore original display", async () => {
    container.innerHTML = `
      <div g-state="test" g-init='{"isVisible": true}'>
        <div g-show="isVisible" style="display: block;">Show me</div>
      </div>
    `;
    bootstrap();
    const div = container.querySelector("div:last-of-type")! as HTMLDivElement;
    await new Promise((resolve) => requestAnimationFrame(resolve)); // Wait for DOM update
    expect(getComputedStyle(div).display).toBe("block");
  });
});
