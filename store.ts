import { create } from 'zustand';
import { TreeState } from './types';

interface AppState {
  mode: TreeState;
  setMode: (mode: TreeState) => void;
  toggleMode: () => void;
}

export const useStore = create<AppState>((set) => ({
  mode: TreeState.TREE_SHAPE,
  setMode: (mode) => set({ mode }),
  toggleMode: () =>
    set((state) => ({
      mode:
        state.mode === TreeState.TREE_SHAPE
          ? TreeState.SCATTERED
          : TreeState.TREE_SHAPE,
    })),
}));