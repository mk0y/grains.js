// src/__tests__/directives/disabled.test.ts
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { bootstrap, GrainElement } from "../../app";
import { callGrainFunction } from "../../core/context";

describe("g-disabled directive", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null!;
  });

  it("should disable a button based on a static boolean expression", () => {
    container.innerHTML = `
      <div g-state="test">
        <button g-disabled="true">Click Me</button>
      </div>
    `;
    bootstrap();
    const button = container.querySelector("button")!;
    expect(button.disabled).toBe(true);
  });

  it("should enable a button based on a static boolean expression", () => {
    container.innerHTML = `
      <div g-state="test">
        <button g-disabled="false">Click Me</button>
      </div>
    `;
    bootstrap();
    const button = container.querySelector("button")!;
    expect(button.disabled).toBe(false);
  });

  it("should dynamically disable a button based on state", async () => {
    container.innerHTML = `
      <div g-state="test" g-init='{"isEnabled": true}'>
        <button g-disabled="!isEnabled">Click Me</button>
        <button g-click="toggle">Toggle</button>
      </div>
    `;

    window.toggle = function (ctx: any) {
      ctx.set({ isEnabled: !ctx.get("isEnabled") });
    };

    bootstrap();
    const button = container.querySelector(
      "button:first-of-type"
    )! as HTMLButtonElement;
    const toggleButton = container.querySelector("button:last-of-type")!;
    const grainEl = container.querySelector("[g-state]") as GrainElement;

    expect(button.disabled).toBe(false);

    await callGrainFunction(grainEl, "toggle");
    await new Promise((resolve) => requestAnimationFrame(resolve));

    expect(button.disabled).toBe(true);

    await callGrainFunction(grainEl, "toggle");
    await new Promise((resolve) => requestAnimationFrame(resolve));

    expect(button.disabled).toBe(false);
    delete window.toggle;
  });

  it("should handle complex expressions", async () => {
    container.innerHTML = `
      <div g-state="test" g-init='{"count": 0}'>
        <button g-disabled="count < 5">Click Me</button>
        <button g-click="increment">Increment</button>
      </div>
    `;

    window.increment = function (ctx: any) {
      ctx.set({ count: ctx.get("count") + 1 });
    };

    bootstrap();
    const button = container.querySelector(
      "button:first-of-type"
    )! as HTMLButtonElement;
    const incrementButton = container.querySelector("button:last-of-type")!;
    const grainEl = container.querySelector("[g-state]") as GrainElement;

    expect(button.disabled).toBe(true);

    await callGrainFunction(grainEl, "increment");
    await new Promise((resolve) => requestAnimationFrame(resolve));

    expect(button.disabled).toBe(true);

    for (let i = 0; i < 4; i++) {
      await callGrainFunction(grainEl, "increment");
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }

    expect(button.disabled).toBe(false);
    delete window.increment;
  });

  it("should handle missing expression", () => {
    container.innerHTML = `
      <div g-state="test">
        <button g-disabled>Click Me</button>
      </div>
    `;
    bootstrap();
    const button = container.querySelector("button")!;
    expect(button.disabled).toBe(false); //Defaults to false if expression is missing or empty string.
  });

  it("should handle empty expression", () => {
    container.innerHTML = `
      <div g-state="test">
        <button g-disabled="">Click Me</button>
      </div>
    `;
    bootstrap();
    const button = container.querySelector("button")!;
    expect(button.disabled).toBe(false); //Defaults to false if expression is missing or empty string.
  });
});
