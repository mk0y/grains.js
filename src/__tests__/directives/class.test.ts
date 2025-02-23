// src/__tests__/directives/class.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { bootstrap, GrainElement } from "../../app";
import { callGrainFunction } from "../../core/context";

describe("g-class directive", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null!;
  });

  it("should apply static class", () => {
    container.innerHTML = `
      <div g-state="test">
        <div g-class="base">Test</div>
      </div>
    `;

    bootstrap();

    const div = container.querySelector("[g-class]")!;
    expect(div.classList.contains("base")).toBe(true);
  });

  it("should handle conditional class based on state", () => {
    container.innerHTML = `
        <div g-state="test" g-init='{"isActive": true}'>
          <div g-class="[isActive && 'active']">Test</div>
        </div>
      `;

    bootstrap();

    const div = container.querySelector("[g-class]")!;
    expect(div.classList.contains("active")).toBe(true);
  });

  it("should handle multiple conditional classes", () => {
    container.innerHTML = `
        <div g-state="test" g-init='{"isActive": true, "hasError": false}'>
          <div g-class="['base', isActive && 'active', hasError && 'error']">Test</div>
        </div>
      `;

    bootstrap();

    const div = container.querySelector("[g-class]")!;
    expect(div.classList.contains("base")).toBe(true);
    expect(div.classList.contains("active")).toBe(true);
    expect(div.classList.contains("error")).toBe(false);
  });

  it("should update classes when state changes", async () => {
    container.innerHTML = `
        <div g-state="test" g-init='{"isActive": false}'>
          <div g-class="[isActive && 'active']">Test</div>
          <button g-click="toggle">Toggle</button>
        </div>
      `;

    window.toggle = function (ctx: any) {
      ctx.set({ isActive: !ctx.get("isActive") });
    };

    bootstrap();

    const grainEl = container.querySelector("[g-state]") as GrainElement;
    const div = container.querySelector("[g-class]")!;

    expect(div.classList.contains("active")).toBe(false);

    await callGrainFunction(grainEl, "toggle");
    await new Promise((resolve) => requestAnimationFrame(resolve));

    expect(div.classList.contains("active")).toBe(true);

    delete window.toggle;
  });

  it("should handle complex conditions", () => {
    container.innerHTML = `
        <div g-state="test" g-init='{"score": 75}'>
          <div g-class="[score > 50 && 'highlight', score > 70 && 'success']">Test</div>
        </div>
      `;

    bootstrap();

    const div = container.querySelector("[g-class]")!;
    expect(div.classList.contains("highlight")).toBe(true);
    expect(div.classList.contains("success")).toBe(true);
  });

  it("should remove classes when conditions become false", async () => {
    container.innerHTML = `
        <div g-state="test" g-init='{"isActive": true}'>
          <div g-class="[isActive && 'active']">Test</div>
          <button g-click="toggle">Toggle</button>
        </div>
      `;

    window.toggle = function (ctx: any) {
      ctx.set({ isActive: false });
    };

    bootstrap();

    const grainEl = container.querySelector("[g-state]") as GrainElement;
    const div = container.querySelector("[g-class]")!;

    expect(div.classList.contains("active")).toBe(true);

    await callGrainFunction(grainEl, "toggle");
    await new Promise((resolve) => requestAnimationFrame(resolve));

    expect(div.classList.contains("active")).toBe(false);

    delete window.toggle;
  });

  it("should handle invalid expressions gracefully", () => {
    container.innerHTML = `
        <div g-state="test">
          <div g-class="[nonexistentProp && 'active']">Test</div>
        </div>
      `;

    bootstrap();

    const div = container.querySelector("[g-class]")!;
    expect(div.classList.contains("active")).toBe(false);
  });

  it("should handle space-separated classes in quoted strings", () => {
    container.innerHTML = `
      <div g-state="test" g-init='{"isActive": true}'>
        <div g-class="['base primary', isActive && 'active highlight']">Test</div>
      </div>
    `;

    bootstrap();

    const div = container.querySelector("[g-class]")!;
    expect(div.classList.contains("base")).toBe(true);
    expect(div.classList.contains("primary")).toBe(true);
    expect(div.classList.contains("active")).toBe(true);
    expect(div.classList.contains("highlight")).toBe(true);
  });

  it("should handle space-separated classes in conditional expressions", () => {
    container.innerHTML = `
      <div g-state="test" g-init='{"isActive": true}'>
        <div g-class="[isActive && 'transform transition-all duration-300']">Test</div>
      </div>
    `;

    bootstrap();

    const div = container.querySelector("[g-class]")!;
    expect(div.classList.contains("transform")).toBe(true);
    expect(div.classList.contains("transition-all")).toBe(true);
    expect(div.classList.contains("duration-300")).toBe(true);
  });

  it("should properly remove space-separated classes when condition becomes false", async () => {
    container.innerHTML = `
      <div g-state="test" g-init='{"isActive": true}'>
        <div g-class="[isActive && 'transform transition-all duration-300']">Test</div>
        <button g-on:click="toggle">Toggle</button>
      </div>
    `;

    window.toggle = function (ctx: any) {
      ctx.set({ isActive: false });
    };

    bootstrap();

    const grainEl = container.querySelector("[g-state]") as GrainElement;
    const div = container.querySelector("[g-class]")!;

    expect(div.classList.contains("transform")).toBe(true);
    expect(div.classList.contains("transition-all")).toBe(true);
    expect(div.classList.contains("duration-300")).toBe(true);

    await callGrainFunction(grainEl, "toggle");
    await new Promise((resolve) => requestAnimationFrame(resolve));

    expect(div.classList.contains("transform")).toBe(false);
    expect(div.classList.contains("transition-all")).toBe(false);
    expect(div.classList.contains("duration-300")).toBe(false);

    delete window.toggle;
  });
});
