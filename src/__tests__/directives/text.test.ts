// src/__tests__/directives/text.test.ts
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { bootstrap, GrainElement } from "../../app";
import { callGrainFunction } from "../../core/context";
import { handleTextDirective } from "../../directives/text";

describe("g-text directive", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null!;
  });

  it("should update text content from a simple state property", () => {
    container.innerHTML = `
      <div g-state="test" g-init='{"message": "Hello, world!"}'>
        <span g-text="message"></span>
      </div>
    `;
    bootstrap();
    const span = container.querySelector("span")!;
    expect(span.textContent).toBe("Hello, world!");
  });

  it("should update text content from a nested state property", () => {
    container.innerHTML = `
      <div g-state="test" g-init='{"user": {"name": "John Doe"}}'>
        <span g-text="user.name"></span>
      </div>
    `;
    bootstrap();
    const span = container.querySelector("span")!;
    expect(span.textContent).toBe("John Doe");
  });

  it("should handle null values", () => {
    container.innerHTML = `
      <div g-state="test" g-init='{"message": null}'>
        <span g-text="message"></span>
      </div>
    `;
    bootstrap();
    const span = container.querySelector("span")!;
    expect(span.textContent).toBe("");
  });

  it("should handle undefined values", () => {
    container.innerHTML = `
      <div g-state="test" g-init='{"message": undefined}'>
        <span g-text="message"></span>
      </div>
    `;
    bootstrap();
    const span = container.querySelector("span")!;
    expect(span.textContent).toBe("");
  });

  it("should handle number values", () => {
    container.innerHTML = `
      <div g-state="test" g-init='{"count": 42}'>
        <span g-text="count"></span>
      </div>
    `;
    bootstrap();
    const span = container.querySelector("span")!;
    expect(span.textContent).toBe("42");
  });

  it("should handle boolean values", () => {
    container.innerHTML = `
      <div g-state="test" g-init='{"isActive": true}'>
        <span g-text="isActive"></span>
      </div>
    `;
    bootstrap();
    const span = container.querySelector("span")!;
    expect(span.textContent).toBe("true");
  });

  it("should update text content when state changes", async () => {
    container.innerHTML = `
      <div g-state="test" g-init='{"message": "Initial"}'>
        <span g-text="message"></span>
        <button g-click="updateMessage">Update</button>
      </div>
    `;

    window.updateMessage = function (ctx: any) {
      ctx.set({ message: "Updated" });
    };

    bootstrap();
    const span = container.querySelector("span")!;
    const button = container.querySelector("button")!;
    const grainEl = container.querySelector("[g-state]") as GrainElement;

    expect(span.textContent).toBe("Initial");

    await callGrainFunction(grainEl, "updateMessage");
    await new Promise((resolve) => requestAnimationFrame(resolve));

    expect(span.textContent).toBe("Updated");

    delete window.updateMessage;
  });

  it("should handle missing g-text attribute gracefully", () => {
    container.innerHTML = `
      <div g-state="test">
        <span></span>
      </div>
    `;
    bootstrap();
    const span = container.querySelector("span")!;
    expect(span.textContent).toBe("");
  });

  it("should handle missing grain element gracefully", () => {
    container.innerHTML = `<span g-text="message"></span>`;
    bootstrap();
    const span = container.querySelector("span")!;
    expect(span.textContent).toBe("");
  });

  it("should handle empty string values correctly", () => {
    container.innerHTML = `
      <div g-state="test" g-init='{"message": ""}'>
        <span g-text="message"></span>
      </div>
    `;
    bootstrap();
    const span = container.querySelector("span")!;
    expect(span.textContent).toBe("");
  });

  it("should handle invalid state paths gracefully", () => {
    container.innerHTML = `
        <div g-state="test" g-init='{"message": "Hello"}'>
          <span g-text="invalid.path"></span>
        </div>
      `;
    bootstrap();
    const span = container.querySelector("span")!;
    expect(span.textContent).toBe("");
  });

  it("should handle missing grain element gracefully", () => {
    container.innerHTML = `<span g-text="message"></span>`;
    bootstrap();
    const span = container.querySelector("span")!;
    expect(span.textContent).toBe("");
  });

  it("should handle missing grain state gracefully", () => {
    // Create a span element that is not associated with a grain
    const span = document.createElement("span");
    span.setAttribute("g-text", "message");
    document.body.appendChild(span);

    // Call the handleTextDirective function directly
    handleTextDirective(span, "message");

    // Assert that the text content is empty
    expect(span.textContent).toBe("");

    document.body.removeChild(span);
  });
});
