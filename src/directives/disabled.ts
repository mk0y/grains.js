import { store } from "../store";

export function updateDisabledState(el: HTMLElement, stateName: string) {
  if (el instanceof HTMLButtonElement) {
    const action = el.getAttribute("g-action");
    if (action === "undo" || action === "redo") {
      const history = store.getHistory(stateName)!;
      el.disabled =
        action === "undo"
          ? history.past.length === 0
          : history.future.length === 0;
    }
  }
}
