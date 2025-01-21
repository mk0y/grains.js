import { beforeEach, describe, expect, it } from "vitest";
import { bootstrap, GrainContext } from "../app";

describe("g-action directive", () => {
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  it("should support undo action", async () => {
    window.increment = ({ get, set }: GrainContext) => {
      set({ count: get("count") + 1 });
    };

    container.innerHTML = `
      <div g-state="counter" g-init='{"count": 0}'>
        <button g-click="increment">+1</button>
        <button g-action="undo">Undo</button>
        <span g-text="count"></span>
      </div>
    `;

    bootstrap();

    const incrementBtn = container.querySelector(
      "button[g-click]"
    ) as HTMLButtonElement;
    const undoBtn = container.querySelector(
      'button[g-action="undo"]'
    ) as HTMLButtonElement;
    const span = container.querySelector("span") as HTMLSpanElement;

    expect(span.textContent).toBe("0");

    // Increment a few times
    await incrementBtn.click();
    await incrementBtn.click();
    await incrementBtn.click();
    expect(span.textContent).toBe("3");

    // Undo last action
    await undoBtn.click();
    expect(span.textContent).toBe("2");

    await undoBtn.click();
    expect(span.textContent).toBe("1");
  });

  it("should support redo action", async () => {
    window.increment = ({ get, set }: GrainContext) => {
      set({ count: get("count") + 1 });
    };

    container.innerHTML = `
      <div g-state="counter" g-init='{"count": 0}'>
        <button g-click="increment">+1</button>
        <button g-action="undo">Undo</button>
        <button g-action="redo">Redo</button>
        <span g-text="count"></span>
      </div>
    `;

    bootstrap();

    const incrementBtn = container.querySelector(
      "button[g-click]"
    ) as HTMLButtonElement;
    const undoBtn = container.querySelector(
      'button[g-action="undo"]'
    ) as HTMLButtonElement;
    const redoBtn = container.querySelector(
      'button[g-action="redo"]'
    ) as HTMLButtonElement;
    const span = container.querySelector("span") as HTMLSpanElement;

    // Initial state
    expect(span.textContent).toBe("0");

    // Increment twice
    await incrementBtn.click();
    await incrementBtn.click();
    expect(span.textContent).toBe("2");

    // Undo both actions
    await undoBtn.click();
    await undoBtn.click();
    expect(span.textContent).toBe("0");

    // Redo both actions
    await redoBtn.click();
    await redoBtn.click();
    expect(span.textContent).toBe("2");
  });

  it("should clear redo history when new action is performed", async () => {
    window.increment = ({ get, set }: GrainContext) => {
      set({ count: get("count") + 1 });
    };

    container.innerHTML = `
      <div g-state="counter" g-init='{"count": 0}'>
        <button g-click="increment">+1</button>
        <button g-action="undo">Undo</button>
        <button g-action="redo">Redo</button>
        <span g-text="count"></span>
      </div>
    `;

    bootstrap();

    const incrementBtn = container.querySelector(
      "button[g-click]"
    ) as HTMLButtonElement;
    const undoBtn = container.querySelector(
      'button[g-action="undo"]'
    ) as HTMLButtonElement;
    const redoBtn = container.querySelector(
      'button[g-action="redo"]'
    ) as HTMLButtonElement;
    const span = container.querySelector("span") as HTMLSpanElement;

    // Create a history
    await incrementBtn.click(); // 1
    await incrementBtn.click(); // 2
    await incrementBtn.click(); // 3
    expect(span.textContent).toBe("3");

    // Undo twice
    await undoBtn.click(); // 2
    await undoBtn.click(); // 1
    expect(span.textContent).toBe("1");

    // Perform new action
    await incrementBtn.click(); // 2
    expect(span.textContent).toBe("2");

    // Try to redo - should not work as history was cleared
    await redoBtn.click();
    expect(span.textContent).toBe("2");
  });

  it("should handle multiple state containers independently", async () => {
    window.increment = ({ get, set }: GrainContext) => {
      set({ count: get("count") + 1 });
    };

    container.innerHTML = `
      <div g-state="counter1" g-init='{"count": 0}'>
        <button g-click="increment">+1</button>
        <button g-action="undo">Undo</button>
        <span g-text="count"></span>
      </div>
      <div g-state="counter2" g-init='{"count": 10}'>
        <button g-click="increment">+1</button>
        <button g-action="undo">Undo</button>
        <span g-text="count"></span>
      </div>
    `;

    bootstrap();

    const counter1 = container.querySelector(
      '[g-state="counter1"]'
    ) as HTMLElement;
    const counter2 = container.querySelector(
      '[g-state="counter2"]'
    ) as HTMLElement;

    const btn1 = counter1.querySelector("button[g-click]") as HTMLButtonElement;
    const undo1 = counter1.querySelector(
      "button[g-action]"
    ) as HTMLButtonElement;
    const span1 = counter1.querySelector("span") as HTMLSpanElement;

    const btn2 = counter2.querySelector("button[g-click]") as HTMLButtonElement;
    const undo2 = counter2.querySelector(
      "button[g-action]"
    ) as HTMLButtonElement;
    const span2 = counter2.querySelector("span") as HTMLSpanElement;

    // Initial states
    expect(span1.textContent).toBe("0");
    expect(span2.textContent).toBe("10");

    // Increment both counters
    await btn1.click();
    await btn1.click();
    await btn2.click();
    await btn2.click();

    expect(span1.textContent).toBe("2");
    expect(span2.textContent).toBe("12");

    // Undo counter1
    await undo1.click();
    expect(span1.textContent).toBe("1");
    expect(span2.textContent).toBe("12"); // counter2 unchanged

    // Undo counter2
    await undo2.click();
    expect(span1.textContent).toBe("1"); // counter1 unchanged
    expect(span2.textContent).toBe("11");
  });
});
