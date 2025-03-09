// src/__tests__/directives/model.test.ts
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { bootstrap } from "../../app";
import { handleModelDirective } from "../../directives/model";

describe("g-model directive", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null!;
  });

  it("should update state on input change (text)", async () => {
    container.innerHTML = `
      <div g-state="formData" g-init='{"name": "Initial Name"}'>
        <input type="text" g-model="name" />
      </div>
    `;

    bootstrap();

    const input = container.querySelector("input")! as HTMLInputElement;
    const grainEl = container.querySelector("[g-state]")!;

    input.value = "New Name";
    input.dispatchEvent(new Event("input"));

    await new Promise((resolve) => requestAnimationFrame(resolve));

    expect((grainEl as any).$grain.name).toBe("New Name");
  });

  it("should update state on input change (number)", async () => {
    container.innerHTML = `
      <div g-state="formData" g-init='{"age": 30}'>
        <input type="number" g-model="age" />
      </div>
    `;

    bootstrap();

    const input = container.querySelector("input")! as HTMLInputElement;
    const grainEl = container.querySelector("[g-state]")!;

    input.value = "35";
    input.dispatchEvent(new Event("input"));

    await new Promise((resolve) => requestAnimationFrame(resolve));

    expect((grainEl as any).$grain.age).toBe("35");
  });

  it("should update state on input change (checkbox)", async () => {
    container.innerHTML = `
      <div g-state="formData" g-init='{"isSubscribed": true}'>
        <input type="checkbox" g-model="isSubscribed" />
      </div>
    `;

    bootstrap();

    const input = container.querySelector("input")! as HTMLInputElement;
    const grainEl = container.querySelector("[g-state]")!;

    input.checked = false;
    input.dispatchEvent(new Event("input"));

    await new Promise((resolve) => requestAnimationFrame(resolve));

    expect((grainEl as any).$grain.isSubscribed).toBe(false);
  });

  it("should handle initial value sync for text input (undefined)", async () => {
    container.innerHTML = `<div g-state="formData" g-init='{}'><input type="text" g-model="name"/></div>`;
    bootstrap();
    const input = container.querySelector("input")! as HTMLInputElement;
    expect(input.value).toBe("");
  });

  it("should handle initial value sync for textarea (undefined)", async () => {
    container.innerHTML = `<div g-state="formData" g-init='{}'><textarea g-model="description"></textarea></div>`;
    bootstrap();
    const textarea = container.querySelector(
      "textarea"
    )! as HTMLTextAreaElement;
    expect(textarea.value).toBe("");
  });

  it("should handle initial value sync for select (undefined)", async () => {
    container.innerHTML = `<div g-state="formData" g-init='{}'><select g-model="selectedOption"><option value="a">A</option></select></div>`;
    bootstrap();
    const select = container.querySelector("select")! as HTMLSelectElement;
    expect(select.value).toBe("");
  });

  it("should handle initial value sync for checkbox (undefined)", async () => {
    container.innerHTML = `<div g-state="formData" g-init='{}'><input type="checkbox" g-model="isActive"/></div>`;
    bootstrap();
    const checkbox = container.querySelector("input")! as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
  });

  it("should handle initial value sync for text input (defined)", async () => {
    container.innerHTML = `<div g-state="formData" g-init='{"name":"test"}'><input type="text" g-model="name"/></div>`;
    bootstrap();
    const input = container.querySelector("input")! as HTMLInputElement;
    expect(input.value).toBe("test");
  });

  it("should handle initial value sync for textarea (defined)", async () => {
    container.innerHTML = `<div g-state="formData" g-init='{"description":"test"}'><textarea g-model="description"></textarea></div>`;
    bootstrap();
    const textarea = container.querySelector(
      "textarea"
    )! as HTMLTextAreaElement;
    expect(textarea.value).toBe("test");
  });

  it("should handle initial value sync for select (defined)", async () => {
    container.innerHTML = `<div g-state="formData" g-init='{"selectedOption":"b"}'><select g-model="selectedOption"><option value="a">A</option><option value="b">B</option></select></div>`;
    bootstrap();
    const select = container.querySelector("select")! as HTMLSelectElement;
    expect(select.value).toBe("b");
  });

  it("should handle initial value sync for checkbox (defined)", async () => {
    container.innerHTML = `<div g-state="formData" g-init='{"isActive":true}'><input type="checkbox" g-model="isActive"/></div>`;
    bootstrap();
    const checkbox = container.querySelector("input")! as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it("should correctly handle a missing grain element", () => {
    const element = document.createElement("input");
    element.setAttribute("g-model", "test");
    expect(() => handleModelDirective(element, "test")).not.toThrow(); //Should not throw error.
  });

  it("should handle initial value sync and updates for textarea element", async () => {
    container.innerHTML = `
      <div g-state="formData" g-init='{"description": "Initial Description"}'>
        <textarea g-model="description"></textarea>
      </div>
    `;

    bootstrap();
    const textarea = container.querySelector(
      "textarea"
    )! as HTMLTextAreaElement;
    const grainEl = container.querySelector("[g-state]")!;

    expect(textarea.value).toBe("Initial Description"); // Initial Sync

    textarea.value = "Updated Description";
    textarea.dispatchEvent(new Event("input"));

    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect((grainEl as any).$grain.description).toBe("Updated Description"); // Update
  });

  it("should update state on select change", async () => {
    container.innerHTML = `
    <div g-state="formData" g-init='{"selectedOption": "apple"}'>
      <select g-model="selectedOption">
        <option value="apple">Apple</option>
        <option value="banana">Banana</option>
      </select>
    </div>
  `;

    bootstrap();

    const select = container.querySelector("select")! as HTMLSelectElement;
    const grainEl = container.querySelector("[g-state]")!;

    select.value = "banana";
    select.dispatchEvent(new Event("change"));

    await new Promise((resolve) => requestAnimationFrame(resolve));

    expect((grainEl as any).$grain.selectedOption).toBe("banana");
  });
});
