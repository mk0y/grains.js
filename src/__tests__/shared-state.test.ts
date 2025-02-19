import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { bootstrap } from "../app";
import { GrainContext } from "../types";

describe("Shared State", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null!;
  });

  it("should access and update other states", async () => {
    container.innerHTML = `
      <div g-state="counter1" g-init='{"count": 0}'>
        <button g-on:click="incrementBoth">Increment Both</button>
        <span g-text="count"></span>
      </div>
      <div g-state="counter2" g-init='{"count": 0}'>
        <span g-text="count"></span>
      </div>
    `;

    window.incrementBoth = (ctx: GrainContext) => {
      ctx.set({ count: ctx.get("count") + 1 });
      ctx.states.counter2.set({ count: ctx.states.counter2.get("count") + 1 });
    };

    bootstrap();

    const button = container.querySelector("button")!;
    const span1 = container.querySelector('[g-state="counter1"] span')!;
    const span2 = container.querySelector('[g-state="counter2"] span')!;

    expect(span1.textContent).toBe("0");
    expect(span2.textContent).toBe("0");

    button.click();
    await new Promise((resolve) => requestAnimationFrame(resolve));

    expect(span1.textContent).toBe("1");
    expect(span2.textContent).toBe("1");

    delete window.incrementBoth;
  });

  it("should handle undo/redo with multiple states", async () => {
    container.innerHTML = `
      <div g-state="counter1" g-init='{"count": 0}'>
        <button g-on:click="incrementBoth">Increment Both</button>
        <button g-action="undo">Undo</button>
        <span g-text="count"></span>
      </div>
      <div g-state="counter2" g-init='{"count": 0}'>
        <button g-action="undo">Undo</button>
        <span g-text="count"></span>
      </div>
    `;

    window.incrementBoth = (ctx: GrainContext) => {
      ctx.set({ count: ctx.get("count") + 1 });
      ctx.states.counter2.set({ count: ctx.states.counter2.get("count") + 1 });
    };

    bootstrap();

    const incrementBtn = container.querySelector(
      '[g-on:click="incrementBoth"]',
    ) as HTMLButtonElement;
    const undo1Btn = container.querySelector(
      '[g-state="counter1"] [g-action="undo"]',
    ) as HTMLButtonElement;
    const undo2Btn = container.querySelector(
      '[g-state="counter2"] [g-action="undo"]',
    ) as HTMLButtonElement;
    const span1 = container.querySelector('[g-state="counter1"] span')!;
    const span2 = container.querySelector('[g-state="counter2"] span')!;

    incrementBtn.click();
    await new Promise((resolve) => requestAnimationFrame(resolve));

    expect(span1.textContent).toBe("1");
    expect(span2.textContent).toBe("1");

    undo1Btn.click();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(span1.textContent).toBe("0");
    expect(span2.textContent).toBe("1"); // Counter2 should remain unchanged

    undo2Btn.click();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(span1.textContent).toBe("0");
    expect(span2.textContent).toBe("0");

    delete window.incrementBoth;
  });

  it("should handle non-existent states gracefully", async () => {
    container.innerHTML = `
      <div g-state="counter1" g-init='{"count": 0}'>
        <button g-on:click="incrementNonExistent">Increment</button>
      </div>
    `;

    const consoleSpy = vi.spyOn(console, "warn");

    window.incrementNonExistent = (ctx: GrainContext) => {
      ctx.states.nonexistent?.set({ count: 1 });
    };

    bootstrap();

    const button = container.querySelector("button")!;
    button.click();
    await new Promise((resolve) => requestAnimationFrame(resolve));

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("attempting to access non-existent state"),
    );

    consoleSpy.mockRestore();
    delete window.incrementNonExistent;
  });

  it("should maintain separate history stacks for each state", async () => {
    container.innerHTML = `
      <div g-state="counter1" g-init='{"count": 0}'>
        <button g-on:click="incrementFirst">Increment First</button>
        <button g-action="undo">Undo</button>
        <span g-text="count"></span>
      </div>
      <div g-state="counter2" g-init='{"count": 0}'>
        <button g-on:click="incrementSecond">Increment Second</button>
        <button g-action="undo">Undo</button>
        <span g-text="count"></span>
      </div>
    `;

    window.incrementFirst = (ctx: GrainContext) => {
      ctx.set({ count: ctx.get("count") + 1 });
    };

    window.incrementSecond = (ctx: GrainContext) => {
      ctx.set({ count: ctx.get("count") + 1 });
    };

    bootstrap();

    const btn1 = container.querySelector(
      '[g-on:click="incrementFirst"]',
    ) as HTMLButtonElement;
    const btn2 = container.querySelector(
      '[g-on:click="incrementSecond"]',
    ) as HTMLButtonElement;
    const undo1 = container.querySelector(
      '[g-state="counter1"] [g-action="undo"]',
    ) as HTMLButtonElement;
    const undo2 = container.querySelector(
      '[g-state="counter2"] [g-action="undo"]',
    ) as HTMLButtonElement;
    const span1 = container.querySelector('[g-state="counter1"] span')!;
    const span2 = container.querySelector('[g-state="counter2"] span')!;

    // Increment both counters
    btn1.click();
    btn2.click();
    await new Promise((resolve) => requestAnimationFrame(resolve));

    expect(span1.textContent).toBe("1");
    expect(span2.textContent).toBe("1");

    // Undo first counter only
    undo1.click();
    await new Promise((resolve) => requestAnimationFrame(resolve));

    expect(span1.textContent).toBe("0");
    expect(span2.textContent).toBe("1");

    // Undo second counter
    undo2.click();
    await new Promise((resolve) => requestAnimationFrame(resolve));

    expect(span1.textContent).toBe("0");
    expect(span2.textContent).toBe("0");

    delete window.incrementFirst;
    delete window.incrementSecond;
  });
});
