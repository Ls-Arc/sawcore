import { create } from "zustand";

interface WorkspaceUiState {
  readonly sidebarOpen: boolean;
  readonly setSidebarOpen: (value: boolean) => void;
}

export const useWorkspaceUiStore = create<WorkspaceUiState>((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (value) => set({ sidebarOpen: value }),
}));
