// src/transitions/presets.ts

export type PresetName = "fade" | "slide" | "scale" | "slideFade";

export interface TransitionPreset {
  enter: {
    classes: string;
    from: string;
    to: string;
    duration: number;
    timing: string;
  };
  leave: {
    classes: string;
    from: string;
    to: string;
    duration: number;
    timing: string;
  };
}

export const transitionPresets: Record<PresetName, TransitionPreset> = {
  fade: {
    enter: {
      classes: "transition-opacity",
      from: "opacity-0",
      to: "opacity-100",
      duration: 300,
      timing: "ease-out",
    },
    leave: {
      classes: "transition-opacity",
      from: "opacity-100",
      to: "opacity-0",
      duration: 200,
      timing: "ease-in",
    },
  },
  slide: {
    enter: {
      classes: "transition-transform",
      from: "-translate-y-4",
      to: "translate-y-0",
      duration: 400,
      timing: "ease-out",
    },
    leave: {
      classes: "transition-transform",
      from: "translate-y-0",
      to: "-translate-y-4",
      duration: 300,
      timing: "ease-in",
    },
  },
  scale: {
    enter: {
      classes: "transition-transform",
      from: "scale-95",
      to: "scale-100",
      duration: 300,
      timing: "ease-out",
    },
    leave: {
      classes: "transition-transform",
      from: "scale-100",
      to: "scale-95",
      duration: 200,
      timing: "ease-in",
    },
  },
  slideFade: {
    enter: {
      classes: "transition-all",
      from: "opacity-0 -translate-y-4",
      to: "opacity-100 translate-y-0",
      duration: 500,
      timing: "ease-out",
    },
    leave: {
      classes: "transition-all",
      from: "opacity-100 translate-y-0",
      to: "opacity-0 -translate-y-4",
      duration: 400,
      timing: "ease-in",
    },
  },
};
