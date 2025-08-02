import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Workspace Store - Local UI State Only
 * TanStack Query now handles server state (submissions, discussions)
 * This store manages only local UI state and preferences
 */
export const useWorkspaceStore = create(
  persist(
    (set, get) => ({
      // UI state for workspace tabs
      selectedTabs: {},
      showHints: {},
      selectedTestCases: {},

      // Editor preferences
      editorSettings: {
        fontSize: 14,
        tabSize: 2,
        wordWrap: 'on',
        lineNumbers: 'on',
        theme: 'vs-dark',
      },

      // Panel visibility
      panelVisibility: {
        description: true,
        testCases: true,
        submissions: false,
        discussion: false,
      },

      // Split panel sizes
      panelSizes: {
        horizontal: [50, 50],
        vertical: [60, 40],
      },

      // Test case visibility
      hiddenTestCases: {},

      // Maximized states
      isEditorMaximized: false,
      isDescriptionMaximized: false,

      // UI Actions
      setEditorSettings: settings => {
        set(state => ({
          editorSettings: { ...state.editorSettings, ...settings },
        }));
      },

      setPanelVisibility: (panel, visible) => {
        set(state => ({
          panelVisibility: { ...state.panelVisibility, [panel]: visible },
        }));
      },

      setPanelSizes: (orientation, sizes) => {
        set(state => ({
          panelSizes: { ...state.panelSizes, [orientation]: sizes },
        }));
      },

      setEditorMaximized: maximized => {
        set({ isEditorMaximized: maximized });
      },

      setDescriptionMaximized: maximized => {
        set({ isDescriptionMaximized: maximized });
      },

      setSelectedTab: (problemId, tab) => {
        set(state => ({
          selectedTabs: { ...state.selectedTabs, [problemId]: tab },
        }));
      },

      setShowHints: (problemId, show) => {
        set(state => ({
          showHints: { ...state.showHints, [problemId]: show },
        }));
      },

      setSelectedTestCase: (problemId, index) => {
        set(state => ({
          selectedTestCases: { ...state.selectedTestCases, [problemId]: index },
        }));
      },

      setHiddenTestCases: (problemId, hiddenCases) => {
        set(state => ({
          hiddenTestCases: {
            ...state.hiddenTestCases,
            [problemId]: hiddenCases,
          },
        }));
      },

      // Getters
      getSelectedTab: problemId =>
        get().selectedTabs[problemId] || 'description',
      getShowHints: problemId => get().showHints[problemId] || false,
      getSelectedTestCase: problemId => get().selectedTestCases[problemId] || 0,
      getHiddenTestCases: problemId => get().hiddenTestCases[problemId] || [],

      // Reset UI state
      resetWorkspaceUI: () => {
        set({
          selectedTabs: {},
          showHints: {},
          selectedTestCases: {},
          hiddenTestCases: {},
          isEditorMaximized: false,
          isDescriptionMaximized: false,
        });
      },
    }),
    {
      name: 'workspace-storage',
      partialize: state => ({
        editorSettings: state.editorSettings,
        panelVisibility: state.panelVisibility,
        panelSizes: state.panelSizes,
        selectedTabs: state.selectedTabs,
        showHints: state.showHints,
        selectedTestCases: state.selectedTestCases,
      }),
    }
  )
);
