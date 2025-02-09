// src/types.ts
export interface Grain {
  [key: string]: any;
}

export interface GrainHistory {
  past: Grain[];
  future: Grain[];
}

export type GrainElement = HTMLElement & {
  $grain: Grain;
  $originalValues: { [key: string]: string };
  $cleanup?: () => void;
};

export type GrainContext = {
  get: (path: string) => any;
  set: (updates: Partial<Grain>) => void;
  getState: () => Grain;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
};

export type DirectiveHandler = (el: HTMLElement, value: string) => void;
