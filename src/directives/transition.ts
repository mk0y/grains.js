export interface TransitionClasses {
  enter: string;
  enterFrom: string;
  enterTo: string;
  leave: string;
  leaveFrom: string;
  leaveTo: string;
}

export const transitionPresets = {
  fade: {
    enter: "transition-opacity duration-300 ease-out",
    enterFrom: "opacity-0",
    enterTo: "opacity-100",
    leave: "transition-opacity duration-300 ease-in",
    leaveFrom: "opacity-100",
    leaveTo: "opacity-0",
  },
  scale: {
    enter: "transition-transform duration-300 ease-out",
    enterFrom: "scale-95",
    enterTo: "scale-100",
    leave: "transition-transform duration-300 ease-in",
    leaveFrom: "scale-100",
    leaveTo: "scale-95",
  },
  slideDown: {
    enter: "transition-all duration-300 ease-out",
    enterFrom: "opacity-0 -translate-y-2",
    enterTo: "opacity-100 translate-y-0",
    leave: "transition-all duration-300 ease-in",
    leaveFrom: "opacity-100 translate-y-0",
    leaveTo: "opacity-0 -translate-y-2",
  },
} as const;

// Separate utility function for transitions
export function transition(
  el: HTMLElement,
  show: boolean,
  preset: keyof typeof transitionPresets = "fade",
) {
  const classes = transitionPresets[preset];

  // Clean up existing transition classes
  Object.values(classes).forEach((cls) =>
    el.classList.remove(...cls.split(" ")),
  );

  if (show) {
    // Enter transition
    el.classList.add(
      ...classes.enter.split(" "),
      ...classes.enterFrom.split(" "),
    );
    requestAnimationFrame(() => {
      el.classList.remove(...classes.enterFrom.split(" "));
      el.classList.add(...classes.enterTo.split(" "));
    });
  } else {
    // Leave transition
    el.classList.add(
      ...classes.leave.split(" "),
      ...classes.leaveFrom.split(" "),
    );
    requestAnimationFrame(() => {
      el.classList.remove(...classes.leaveFrom.split(" "));
      el.classList.add(...classes.leaveTo.split(" "));
    });
  }
}

// Directive handler
export function handleTransitionDirective(_: HTMLElement, __: string): void {
  // The actual transition will be triggered by g-show directive
  return;
}
