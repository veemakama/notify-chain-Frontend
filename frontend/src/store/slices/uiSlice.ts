import type { StateCreator } from 'zustand';
import type {
  AppStore,
  UIState,
  UIActions,
  ViewMode,
  Theme,
  DashboardFilterPreset,
} from '../types';
import { DEFAULT_UI_STATE } from '../defaults';

export const uiSlice: StateCreator<AppStore, [], [], UIState & UIActions> = (set) => ({
  // Initial state
  ...DEFAULT_UI_STATE,

  // Actions
  toggleSidebar: () =>
    set((state) => ({
      sidebarOpen: !state.sidebarOpen,
    })),

  openModal: (modalId: string) =>
    set(() => ({
      activeModal: modalId,
    })),

  closeModal: () =>
    set(() => ({
      activeModal: null,
    })),

  setViewMode: (mode: ViewMode) =>
    set(() => ({
      viewMode: mode,
    })),

  setTheme: (theme: Theme) =>
    set(() => ({
      theme,
    })),

  setDashboardChainFilter: (chain: string) =>
    set(() => ({
      dashboardChainFilter: chain,
    })),

  setDashboardSearchQuery: (query: string) =>
    set(() => ({
      dashboardSearchQuery: query,
    })),

  saveDashboardFilterPreset: (name: string) =>
    set((state) => {
      const now = new Date().toISOString();
      const preset: DashboardFilterPreset = {
        id: `preset_${Date.now().toString(36)}_${Math.random()
          .toString(36)
          .slice(2, 8)}`,
        name,
        dashboardChainFilter: state.dashboardChainFilter,
        dashboardSearchQuery: state.dashboardSearchQuery,
        createdAt: now,
        updatedAt: now,
      };

      return {
        dashboardFilterPresets: [...state.dashboardFilterPresets, preset],
      };
    }),

  updateDashboardFilterPreset: (id: string, name: string) =>
    set((state) => ({
      dashboardFilterPresets: state.dashboardFilterPresets.map((preset) =>
        preset.id === id
          ? {
              ...preset,
              name,
              updatedAt: new Date().toISOString(),
            }
          : preset
      ),
    })),

  deleteDashboardFilterPreset: (id: string) =>
    set((state) => ({
      dashboardFilterPresets: state.dashboardFilterPresets.filter(
        (preset) => preset.id !== id
      ),
    })),

  applyDashboardFilterPreset: (id: string) =>
    set((state) => {
      const preset = state.dashboardFilterPresets.find((item) => item.id === id);
      if (!preset) return {};

      return {
        dashboardChainFilter: preset.dashboardChainFilter,
        dashboardSearchQuery: preset.dashboardSearchQuery,
      };
    }),

  resetUIState: () =>
    set((state) => ({
      ...DEFAULT_UI_STATE,
      dashboardFilterPresets: state.dashboardFilterPresets,
    })),
});
