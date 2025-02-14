// src/__tests__/batcher.test.ts
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  MockInstance,
} from "vitest";
import UpdateBatcher, { updateElement } from "../batcher";
import { ElementCache } from "../cache";
import { updateElementContent } from "../directives/base";
import { GrainElement } from "../types";

// Mock dependencies
vi.mock("../cache", () => ({
  ElementCache: {
    getCache: vi.fn(),
    cacheElements: vi.fn(() => ({
      allElements: [],
      textElements: [],
      showElements: [],
      interactiveElements: [],
    })),
  },
}));

vi.mock("../directives/base", () => ({
  updateElementContent: vi.fn(),
}));

// Helper function to create GrainElements
function createGrainElement(): GrainElement {
  const element = document.createElement("div");
  return Object.assign(element, {
    $grain: {}, // You might need to provide a proper Grain object here
    $originalValues: {},
    $cleanup: undefined,
  }) as GrainElement;
}

describe("UpdateBatcher", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      return setTimeout(() => cb(performance.now()), 0) as unknown as number;
    });
    UpdateBatcher["pendingUpdates"].clear();
    UpdateBatcher["frameRequested"] = false;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should batch multiple updates into a single frame", () => {
    const element1 = createGrainElement();
    const element2 = createGrainElement();
    const element3 = createGrainElement();

    // Schedule multiple updates
    updateElement(element1);
    updateElement(element2);
    updateElement(element3);
    updateElement(element1); // Duplicate update for same element

    expect(UpdateBatcher["pendingUpdates"].size).toBe(3);
    expect(UpdateBatcher["frameRequested"]).toBe(true);

    vi.runAllTimers();

    expect(UpdateBatcher["pendingUpdates"].size).toBe(0);
    expect(UpdateBatcher["frameRequested"]).toBe(false);
    expect(ElementCache.getCache).toHaveBeenCalledTimes(3);
  });

  it("should request animation frame only once for multiple updates", () => {
    const requestAnimationFrameSpy = vi.spyOn(window, "requestAnimationFrame");
    const element1 = createGrainElement();
    const element2 = createGrainElement();

    updateElement(element1);
    updateElement(element2);
    updateElement(element1);

    expect(requestAnimationFrameSpy).toHaveBeenCalledTimes(1);
  });

  it("should force update immediately without batching", () => {
    const element = createGrainElement();
    const mockCache = {
      allElements: [element],
      textElements: [],
      showElements: [],
      interactiveElements: [],
    };

    const getCacheMock = vi.mocked(ElementCache.getCache);
    getCacheMock.mockReturnValue(mockCache);

    updateElement(element);
    expect(UpdateBatcher["pendingUpdates"].size).toBe(1);

    UpdateBatcher.forceUpdate(element);

    expect(UpdateBatcher["pendingUpdates"].size).toBe(0);
    expect(updateElementContent).toHaveBeenCalledWith(element);
    expect(ElementCache.getCache).toHaveBeenCalledWith(element);
  });

  it("should process updates for all cached elements", () => {
    const rootElement = createGrainElement();
    const child1 = document.createElement("div");
    const child2 = document.createElement("div");

    const mockCache = {
      allElements: [child1, child2],
      textElements: [],
      showElements: [],
      interactiveElements: [],
    };

    const getCacheMock = vi.mocked(ElementCache.getCache);
    getCacheMock.mockReturnValue(mockCache);

    updateElement(rootElement);
    const rafSpy = vi.spyOn(window, "requestAnimationFrame");
    vi.runAllTimers();
    expect(updateElementContent).toHaveBeenCalledTimes(2);
  });

  it("should properly handle requestAnimationFrame", () => {
    const callback = vi.fn();
    requestAnimationFrame(callback);
    expect(callback).not.toHaveBeenCalled();
    vi.advanceTimersToNextTimer(); // Instead of runAllTimers
    expect(callback).toHaveBeenCalled();
  });
});
