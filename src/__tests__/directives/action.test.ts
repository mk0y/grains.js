// src/__tests__/directives/action.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { bootstrap } from "../../app";
import { GrainContext } from "../../types";

describe("g-action directive", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null!;
  });

  it("should handle undo action", async () => {
    container.innerHTML = `
      <div g-state="test" g-init='{"count": 0}'>
        <button g-on:click="increment">+1</button>
        <button g-action="undo">Undo</button>
        <span g-text="count"></span>
      </div>
    `;

    window.increment = (ctx: GrainContext) => {
      ctx.set({ count: ctx.get("count") + 1 });
    };

    bootstrap();

    const incrementBtn = container.querySelector(
      '[g-on:click="increment"]',
    ) as HTMLButtonElement;
    const undoBtn = container.querySelector(
      '[g-action="undo"]',
    ) as HTMLButtonElement;
    const span = container.querySelector("span")!;

    incrementBtn.click();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(span.textContent).toBe("1");

    undoBtn.click();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(span.textContent).toBe("0");

    delete window.increment;
  });

  it("should handle redo action", async () => {
    container.innerHTML = `
      <div g-state="test" g-init='{"count": 0}'>
        <button g-on:click="increment">+1</button>
        <button g-action="undo">Undo</button>
        <button g-action="redo">Redo</button>
        <span g-text="count"></span>
      </div>
    `;

    window.increment = (ctx: GrainContext) => {
      ctx.set({ count: ctx.get("count") + 1 });
    };

    bootstrap();

    const incrementBtn = container.querySelector(
      '[g-on:click="increment"]',
    ) as HTMLButtonElement;
    const undoBtn = container.querySelector(
      '[g-action="undo"]',
    ) as HTMLButtonElement;
    const redoBtn = container.querySelector(
      '[g-action="redo"]',
    ) as HTMLButtonElement;
    const span = container.querySelector("span")!;

    incrementBtn.click();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(span.textContent).toBe("1");

    undoBtn.click();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(span.textContent).toBe("0");

    redoBtn.click();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(span.textContent).toBe("1");

    delete window.increment;
  });

  it("should handle multiple undo/redo actions", async () => {
    container.innerHTML = `
      <div g-state="test" g-init='{"count": 0}'>
        <button g-on:click="increment">+1</button>
        <button g-action="undo">Undo</button>
        <button g-action="redo">Redo</button>
        <span g-text="count"></span>
      </div>
    `;

    window.increment = (ctx: GrainContext) => {
      ctx.set({ count: ctx.get("count") + 1 });
    };

    bootstrap();

    const incrementBtn = container.querySelector(
      '[g-on:click="increment"]',
    ) as HTMLButtonElement;
    const undoBtn = container.querySelector(
      '[g-action="undo"]',
    ) as HTMLButtonElement;
    const redoBtn = container.querySelector(
      '[g-action="redo"]',
    ) as HTMLButtonElement;
    const span = container.querySelector("span")!;

    // Do multiple increments
    incrementBtn.click();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    incrementBtn.click();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    incrementBtn.click();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(span.textContent).toBe("3");

    // Undo multiple times
    undoBtn.click();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    undoBtn.click();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(span.textContent).toBe("1");

    // Redo multiple times
    redoBtn.click();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    redoBtn.click();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(span.textContent).toBe("3");

    delete window.increment;
  });
});
