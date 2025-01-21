import { beforeEach, describe, expect, it, vi } from "vitest";
import { bootstrap, observe } from "../app";

describe("Grains.js State Management", () => {
  let el: HTMLElement;
  let callback: () => void;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("div");
    document.body.appendChild(el);
    callback = vi.fn();
  });

  describe("observe", () => {
    it("should create a reactive proxy that triggers callback on changes", () => {
      const state = observe({ count: 0 }, callback);

      expect(state.count).toBe(0);
      expect(callback).not.toHaveBeenCalled();

      state.count = 1;
      expect(state.count).toBe(1);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should handle nested objects", () => {
      const state = observe({ user: { name: "John" } }, callback);

      state.user.name = "Jane";
      expect(state.user.name).toBe("Jane");
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe("g-state directive", () => {
    it("should initialize state from g-init attribute", () => {
      el.innerHTML = `
        <div g-state="testState" g-init='{"count": 0}'>
          <span g-text="count"></span>
        </div>
      `;

      bootstrap();

      expect(window["testState"]).toBeDefined();
      expect(window["testState"].count).toBe(0);
      expect(el.querySelector("span")!.textContent).toBe("0");
    });

    it("should update text content based on g-text directive", () => {
      el.innerHTML = `
        <div g-state="testState" g-init='{"message": "Hello"}'>
          <span g-text="message"></span>
        </div>
      `;

      bootstrap();

      const span = el.querySelector("span")!;
      expect(span.textContent).toBe("Hello");

      window["testState"].message = "Updated";
      expect(span.textContent).toBe("Updated");
    });
  });
});
