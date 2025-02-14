import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { bootstrap, grainStore } from "../app";
import { JSDOM } from "jsdom";
import { setupGrain } from "../core/setup";

// Mock setupGrain
vi.mock("../core/setup", () => ({
  setupGrain: vi.fn(),
}));

describe("bootstrap", () => {
  beforeEach(() => {
    // Setup a fresh DOM for each test
    const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
    global.document = dom.window.document;
    global.window = dom.window as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should clear the store when bootstrapping", () => {
    const clearSpy = vi.spyOn(grainStore, "clear");
    bootstrap();
    expect(clearSpy).toHaveBeenCalled();
  });

  it("should setup grains for elements with g-state directive", () => {
    // Prepare DOM with multiple g-state elements
    document.body.innerHTML = `
      <div g-state="counter"></div>
      <div g-state="todo"></div>
    `;

    bootstrap();

    // Verify setupGrain was called for each g-state element
    expect(setupGrain).toHaveBeenCalledTimes(2);
  });

  it("should not setup grains when no g-state elements exist", () => {
    // Empty DOM
    document.body.innerHTML = `
      <div></div>
      <div g-click="increment"></div>
    `;

    bootstrap();

    // Verify setupGrain was not called
    expect(setupGrain).not.toHaveBeenCalled();
  });
});
