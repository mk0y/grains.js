import { beforeEach, describe, expect, it, vi } from "vitest";
import { bootstrap, GrainElement } from "../app";

describe("g-click directive", () => {
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  it("should call the specified function when clicked", async () => {
    const mockFn = vi.fn();
    window.increment = mockFn;

    container.innerHTML = `
      <div g-state="counter" g-init='{"count": 0}'>
        <button g-click="increment">+1</button>
        <span g-text="count"></span>
      </div>
    `;

    bootstrap();

    const button = container.querySelector("button")!;
    await button.click();

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith(
      expect.objectContaining({
        get: expect.any(Function),
        set: expect.any(Function),
        getState: expect.any(Function),
        undo: expect.any(Function),
        redo: expect.any(Function),
      }),
      []
    );
  });

  it("should pass arguments to the click handler", async () => {
    const mockFn = vi.fn();
    window.updateCount = mockFn;

    container.innerHTML = `
      <div g-state="counter" g-init='{"count": 0}'>
        <button g-click="updateCount" g-args='[5]'>Add 5</button>
        <span g-text="count"></span>
      </div>
    `;

    bootstrap();

    const button = container.querySelector("button")!;
    await button.click();

    expect(mockFn).toHaveBeenCalledWith(expect.any(Object), [5]);
  });

  it("should update state when click handler sets new state", async () => {
    window.increment = ({ get, set }) => {
      set({ count: get("count") + 1 });
    };

    container.innerHTML = `
      <div g-state="counter" g-init='{"count": 0}'>
        <button g-click="increment">+1</button>
        <span g-text="count"></span>
      </div>
    `;

    bootstrap();

    const button = container.querySelector("button")!;
    const span = container.querySelector("span")!;

    expect(span.textContent).toBe("0");

    await button.click();
    expect(span.textContent).toBe("1");

    await button.click();
    expect(span.textContent).toBe("2");
  });

  it("should handle async click handlers", async () => {
    vi.useFakeTimers();

    window.delayedIncrement = async ({ get, set }) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      set({ count: get("count") + 1 });
    };

    container.innerHTML = `
      <div g-state="counter" g-init='{"count": 0}'>
        <button g-click="delayedIncrement">+1</button>
        <span g-text="count"></span>
      </div>
    `;

    bootstrap();

    const button = container.querySelector("button")!;
    const span = container.querySelector("span")!;

    expect(span.textContent).toBe("0");

    button.click();
    await vi.advanceTimersByTime(1000);
    expect(span.textContent).toBe("1");

    vi.useRealTimers();
  });

  it("should cleanup event listeners when element is removed", () => {
    const mockFn = vi.fn();
    window.increment = mockFn;

    container.innerHTML = `
      <div g-state="counter" g-init='{"count": 0}'>
        <button g-click="increment">+1</button>
      </div>
    `;

    bootstrap();

    const stateElement = container.querySelector("[g-state]") as GrainElement;
    const button = container.querySelector("button")!;

    // Click once to verify handler works
    button.click();
    expect(mockFn).toHaveBeenCalledTimes(1);

    // Remove the element and cleanup
    stateElement.remove();
    stateElement.$cleanup?.();

    // Click should not trigger the handler anymore
    button.click();
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});
