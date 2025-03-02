// src/__tests__/directives/attr.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { bootstrap, GrainElement } from "../../app";
import { callGrainFunction } from "../../core/context";

describe("g-attr directive", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null!;
  });

  it("should set simple attribute from state", () => {
    container.innerHTML = `
      <div g-state="test" g-init='{"imageUrl": "/test.jpg"}'>
        <img g-attr="src: {imageUrl}">
      </div>
    `;

    bootstrap();

    const img = container.querySelector("img")!;
    expect(img.getAttribute("src")).toBe("/test.jpg");
  });

  it("should handle multiple attributes", () => {
    container.innerHTML = `
      <div g-state="test" g-init='{"imageUrl": "/test.jpg", "altText": "Test Image"}'>
        <img g-attr="src: {imageUrl}, alt: {altText}">
      </div>
    `;

    bootstrap();

    const img = container.querySelector("img")!;
    expect(img.getAttribute("src")).toBe("/test.jpg");
    expect(img.getAttribute("alt")).toBe("Test Image");
  });

  it("should handle boolean attributes", () => {
    container.innerHTML = `
      <div g-state="test" g-init='{"isDisabled": true}'>
        <button g-attr="disabled: {isDisabled}">Test</button>
      </div>
    `;

    bootstrap();

    const button = container.querySelector("button")!;
    expect(button.hasAttribute("disabled")).toBe(true);
  });

  it("should remove boolean attributes when false", () => {
    container.innerHTML = `
      <div g-state="test" g-init='{"isDisabled": false}'>
        <button g-attr="disabled: {isDisabled}">Test</button>
      </div>
    `;

    bootstrap();

    const button = container.querySelector("button")!;
    expect(button.hasAttribute("disabled")).toBe(false);
  });

  it("should handle expressions", () => {
    container.innerHTML = `
      <div g-state="test" g-init='{"count": 5, "threshold": 10}'>
        <button g-attr="disabled: {count < threshold}">Test</button>
      </div>
    `;

    bootstrap();

    const button = container.querySelector("button")!;
    expect(button.hasAttribute("disabled")).toBe(true);
  });

  it("should remove attributes when value is null/undefined", () => {
    container.innerHTML = `
      <div g-state="test" g-init='{"imageUrl": null}'>
        <img g-attr="src: {imageUrl}">
      </div>
    `;

    bootstrap();

    const img = container.querySelector("img")!;
    expect(img.hasAttribute("src")).toBe(false);
  });

  it("should update attributes when state changes", async () => {
    container.innerHTML = `
      <div g-state="test" g-init='{"imageUrl": "/old.jpg"}'>
        <img g-attr="src: {imageUrl}">
        <button g-click="updateImage">Update</button>
      </div>
    `;

    // Define the update function
    window.updateImage = function (ctx: any) {
      ctx.set({ imageUrl: "/new.jpg" });
    };

    bootstrap();

    const grainEl = container.querySelector("[g-state]") as GrainElement;
    const img = container.querySelector("img")!;

    expect(img.getAttribute("src")).toBe("/old.jpg");

    // Call the function through the proper channel
    await callGrainFunction(grainEl, "updateImage");

    await new Promise((resolve) => requestAnimationFrame(resolve));

    expect(img.getAttribute("src")).toBe("/new.jpg");

    // Clean up
    delete window.updateImage;
  });

  it("should handle invalid expressions gracefully", () => {
    container.innerHTML = `
      <div g-state="test" g-init='{}'>
        <img g-attr="src: {nonexistentProperty}">
      </div>
    `;

    bootstrap();

    const img = container.querySelector("img")!;
    expect(img.hasAttribute("src")).toBe(false);
  });

  it("should handle complex expressions with multiple conditions", () => {
    container.innerHTML = `
      <div g-state="test" g-init='{"count": 5, "isAdmin": true}'>
        <button g-attr="disabled: {count < 10 && !isAdmin}">Test</button>
      </div>
    `;

    bootstrap();

    const button = container.querySelector("button")!;
    expect(button.hasAttribute("disabled")).toBe(false);
  });

  it("should handle empty attribute names gracefully", () => {
    const consoleSpy = vi.spyOn(console, "warn");
    container.innerHTML = `
      <div g-state="test">
        <img g-attr=": {imageUrl}">
      </div>
    `;
    bootstrap();
    expect(consoleSpy).toHaveBeenCalledWith(
      "Empty attribute name in g-attr directive:",
      expect.any(HTMLElement)
    );
    consoleSpy.mockRestore();
  });

  it("should handle empty expressions gracefully", () => {
    const consoleSpy = vi.spyOn(console, "warn");
    container.innerHTML = `
      <div g-state="test">
        <img g-attr="src:">
      </div>
    `;
    bootstrap();
    expect(consoleSpy).toHaveBeenCalledWith(
      'Empty expression for attribute "src" in g-attr directive:',
      expect.any(HTMLElement)
    );
    consoleSpy.mockRestore();
  });

  it("should handle invalid attribute names gracefully", () => {
    const consoleSpy = vi.spyOn(console, "warn");
    container.innerHTML = `
      <div g-state="test">
        <img g-attr="src!: {imageUrl}">
      </div>
    `;
    bootstrap();
    expect(consoleSpy).toHaveBeenCalledWith(
      'Invalid attribute name "src!" in g-attr directive. Use only letters, numbers, hyphens, and underscores:',
      expect.any(HTMLElement)
    );
    consoleSpy.mockRestore();
  });

  it("should handle potentially invalid HTML attributes with a warning", () => {
    const consoleSpy = vi.spyOn(console, "warn");
    container.innerHTML = `
      <div g-state="test">
        <img g-attr="invalid-attr: {imageUrl}">
      </div>
    `;
    bootstrap();
    expect(consoleSpy).toHaveBeenCalledWith(
      'Potentially invalid HTML attribute "invalid-attr" in g-attr directive:',
      expect.any(HTMLElement)
    );
    consoleSpy.mockRestore();
  });

  it("should handle unclosed placeholders gracefully", () => {
    const consoleSpy = vi.spyOn(console, "warn");
    container.innerHTML = `
      <div g-state="test">
        <img g-attr="src: {imageUrl">
      </div>
    `;
    bootstrap();
    expect(consoleSpy).toHaveBeenCalledWith(
      'Unclosed placeholder in expression "{imageUrl" for attribute "src":',
      expect.any(HTMLElement)
    );
    consoleSpy.mockRestore();
  });

  it("should handle invalid attribute syntax gracefully", () => {
    const consoleSpy = vi.spyOn(console, "warn");
    container.innerHTML = `
      <div g-state="test">
        <img g-attr="src expression">
      </div>
    `;
    bootstrap();
    expect(consoleSpy).toHaveBeenCalledWith(
      'Invalid g-attr syntax. Use "attribute: expression" format:',
      expect.any(HTMLElement)
    );
    consoleSpy.mockRestore();
  });

  it("should handle multiple invalid bindings gracefully", () => {
    const consoleSpy = vi.spyOn(console, "warn");
    container.innerHTML = `
      <div g-state="test">
        <img g-attr="src: {imageUrl}, alt:, invalid-attr: {imageUrl}">
      </div>
    `;
    bootstrap();
    expect(consoleSpy).toHaveBeenCalledTimes(2); // Expect warnings for empty expression and invalid attribute name
    consoleSpy.mockRestore();
  });

  it("should handle simple state reference without complex expression checks", async () => {
    container.innerHTML = `
      <div g-state="test" g-init='{"imageUrl": "/test.jpg"}'>
        <img g-attr="src: {imageUrl}">
      </div>
    `;

    bootstrap();

    const img = container.querySelector("img")!;
    expect(img.getAttribute("src")).toBe("/test.jpg");
  });

  it("should handle null and undefined values correctly", () => {
    container.innerHTML = `
      <div g-state="test" g-init='{"testAttr": null}'>
        <img g-attr="alt: {testAttr}">
      </div>
    `;
    bootstrap();
    const img = container.querySelector("img")!;
    expect(img.getAttribute("alt")).toBe(null);

    container.innerHTML = `
      <div g-state="test" g-init='{"testAttr": undefined}'>
        <img g-attr="alt: {testAttr}">
      </div>
    `;
    bootstrap();
    const img2 = container.querySelector("img")!;
    expect(img2.hasAttribute("alt")).toBe(false);
  });
});
