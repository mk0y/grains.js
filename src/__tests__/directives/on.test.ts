// src/__tests__/directives/on.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { bootstrap, GrainElement } from "../../app";
// import { callGrainFunction } from "../../core/context";

describe("g-on directive", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null!;
  });

  it("should handle click events", async () => {
    const mockFn = vi.fn();
    window.handleClick = mockFn;

    container.innerHTML = `
      <div g-state="test" g-init='{"count": 0}'>
        <button g-on:click="handleClick">Click me</button>
      </div>
    `;

    bootstrap();

    const button = container.querySelector("button")!;
    button.click();

    await new Promise((resolve) => requestAnimationFrame(resolve));

    expect(mockFn).toHaveBeenCalled();

    // Clean up
    delete window.handleClick;
  });

  it("should handle multiple events on same element", async () => {
    const clickFn = vi.fn();
    const mouseoverFn = vi.fn();
    window.handleClick = clickFn;
    window.handleMouseover = mouseoverFn;

    container.innerHTML = `
        <div g-state="test" g-init='{"count": 0}'>
          <button
            g-on:click="handleClick"
            g-on:mouseover="handleMouseover"
          >Multi-event button</button>
        </div>
      `;

    bootstrap();

    const button = container.querySelector("button")!;
    button.click();
    button.dispatchEvent(new Event("mouseover"));

    expect(clickFn).toHaveBeenCalled();
    expect(mouseoverFn).toHaveBeenCalled();

    delete window.handleClick;
    delete window.handleMouseover;
  });

  it("should pass context to event handler", async () => {
    let contextValue;
    window.handleClick = (ctx) => {
      contextValue = ctx;
    };

    container.innerHTML = `
        <div g-state="test" g-init='{"count": 42}'>
          <button g-on:click="handleClick">Context Test</button>
        </div>
      `;

    bootstrap();

    const button = container.querySelector("button")!;
    button.click();

    expect(contextValue).toBeDefined();
    expect(contextValue.get("count")).toBe(42);

    delete window.handleClick;
  });

  it("should handle g-args attribute", async () => {
    const mockFn = vi.fn();
    window.handleClick = mockFn;

    container.innerHTML = `
        <div g-state="test" g-init='{"count": 0}'>
          <button g-on:click="handleClick" g-args='["arg1", 42]'>Args Test</button>
        </div>
      `;

    bootstrap();

    const button = container.querySelector("button")!;
    button.click();

    // Updated expectation to match actual behavior
    expect(mockFn).toHaveBeenCalledWith(
      expect.objectContaining({
        get: expect.any(Function),
        set: expect.any(Function),
        undo: expect.any(Function),
        redo: expect.any(Function),
        canUndo: expect.any(Function),
        canRedo: expect.any(Function),
        getState: expect.any(Function),
      }),
      ["arg1", 42] // args are passed as an array
    );

    delete window.handleClick;
  });

  it("should warn about non-existent handler functions", () => {
    const consoleSpy = vi.spyOn(console, "warn");

    container.innerHTML = `
        <div g-state="test" g-init='{"count": 0}'>
          <button g-on:click="nonExistentFunction">Missing Function</button>
        </div>
      `;

    bootstrap();

    expect(consoleSpy).toHaveBeenCalledWith(
      '[Grains.js] Function "nonExistentFunction" not found in global scope. Make sure it\'s defined before the element. Element:',
      expect.any(HTMLButtonElement)
    );

    consoleSpy.mockRestore();
  });

  it("should handle state updates in event handlers", async () => {
    window.incrementCount = (ctx) => {
      ctx.set({ count: ctx.get("count") + 1 });
    };

    container.innerHTML = `
        <div g-state="test" g-init='{"count": 0}'>
          <button g-on:click="incrementCount">Increment</button>
          <span g-text="count"></span>
        </div>
      `;

    bootstrap();

    const button = container.querySelector("button")!;
    const span = container.querySelector("span")!;

    expect(span.textContent).toBe("0");

    button.click();
    await new Promise((resolve) => requestAnimationFrame(resolve));

    expect(span.textContent).toBe("1");

    delete window.incrementCount;
  });

  it("should cleanup event listeners", () => {
    const mockFn = vi.fn();
    window.handleClick = mockFn;

    container.innerHTML = `
        <div g-state="test" g-init='{"count": 0}'>
          <button g-on:click="handleClick">Cleanup Test</button>
        </div>
      `;

    bootstrap();

    const grainEl = container.querySelector("[g-state]") as GrainElement;
    const button = container.querySelector("button")!;

    // Call cleanup
    grainEl.$cleanup?.();

    button.click();
    expect(mockFn).not.toHaveBeenCalled();

    delete window.handleClick;
  });

  it("should handle form submission", async () => {
    const handleSubmit = vi.fn();
    window.handleSubmit = handleSubmit;

    container.innerHTML = `
      <div g-state="formData" g-init='{"name": "", "email": ""}'>
        <form g-on:submit="handleSubmit">
          <input type="text" name="name" g-model="name" />
          <input type="text" name="email" g-model="email" />
          <button type="submit">Submit</button>
        </form>
      </div>
    `;

    bootstrap();

    const form = container.querySelector("form")!;
    const nameInput = form.querySelector(
      'input[name="name"]'
    ) as HTMLInputElement;
    const emailInput = form.querySelector(
      'input[name="email"]'
    ) as HTMLInputElement;

    nameInput.value = "Test User";
    emailInput.value = "test@example.com";

    form.dispatchEvent(new Event("submit"));

    await new Promise((resolve) => requestAnimationFrame(resolve));

    expect(handleSubmit).toHaveBeenCalled(); //Check if called at all first.
    let [context, event] = handleSubmit.mock.calls[0];
    const args = handleSubmit.mock.calls[0];
    // console.log("Arguments passed to handleSubmit:", args); // crucial debugging step
    console.log({ context, event, args });

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        get: expect.any(Function),
        set: expect.any(Function),
        undo: expect.any(Function),
        redo: expect.any(Function),
        canUndo: expect.any(Function),
        canRedo: expect.any(Function),
        getState: expect.any(Function),
        states: expect.any(Object),
      }),
      [expect.any(HTMLFormElement), expect.any(Event)]
    );
    delete window.handleSubmit;
  });
});
