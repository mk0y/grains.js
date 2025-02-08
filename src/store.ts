import { Grain, GrainHistory } from "./types";

class GrainStore {
  private grains = new Map<string, Grain>();
  private history = new Map<string, GrainHistory>();

  clear() {
    this.grains.clear();
    this.history.clear();
  }

  set(name: string, grain: Grain) {
    this.grains.set(name, grain);
  }

  get(name: string) {
    return this.grains.get(name);
  }

  delete(name: string) {
    this.grains.delete(name);
    this.history.delete(name);
  }

  getHistory(name: string) {
    return this.history.get(name);
  }

  initHistory(name: string) {
    this.history.set(name, { past: [], future: [] });
  }
}

export const store = new GrainStore();
