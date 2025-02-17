// src/__tests__/directives/attr.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
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
});
