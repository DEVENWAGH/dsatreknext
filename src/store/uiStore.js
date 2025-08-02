import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * UI Store - Global UI State Management
 * Handles navigation, modals, filters, and global UI preferences
 * TanStack Query handles server state, this manages client-side UI only
 */
export const useUIStore = create(
  persist(
    (set, get) => ({
      // Navigation state
      isSidebarOpen: false,
      menuOpen: false,

      // Global modals
      modals: {
        delete: false,
        edit: false,
        add: false,
        settings: false,
        profile: false,
      },

      // Global notifications
      notifications: [],

      // Loading states (for global UI)
      globalLoading: false,

      // Filter states
      searchQuery: '',
      selectedDifficulty: 'all',
      selectedTags: [],
      selectedCompanies: [],
      currentPage: 1,

      // Code editor states
      selectedLanguage: 'CPP',
      editorTheme: 'vs-dark',
      fontSize: 14,

      // Theme preferences
      codeEditorSettings: {
        theme: 'vs-dark',
        fontSize: 14,
        minimap: { enabled: false },
        wordWrap: 'on',
        lineNumbers: 'on',
        folding: true,
        scrollBeyondLastLine: false,
        automaticLayout: true,
      },

      // Navigation actions
      setSidebarOpen: isOpen => set({ isSidebarOpen: isOpen }),
      toggleSidebar: () =>
        set(state => ({ isSidebarOpen: !state.isSidebarOpen })),
      setMenuOpen: isOpen => set({ menuOpen: isOpen }),
      toggleMenu: () => set(state => ({ menuOpen: !state.menuOpen })),

      // Modal actions
      setModal: (modalName, isOpen) =>
        set(state => ({
          modals: { ...state.modals, [modalName]: isOpen },
        })),

      closeAllModals: () =>
        set(state => ({
          modals: Object.keys(state.modals).reduce((acc, key) => {
            acc[key] = false;
            return acc;
          }, {}),
        })),

      // Notification actions
      addNotification: notification =>
        set(state => ({
          notifications: [
            ...state.notifications,
            { ...notification, id: Date.now() },
          ],
        })),

      removeNotification: id =>
        set(state => ({
          notifications: state.notifications.filter(n => n.id !== id),
        })),

      clearNotifications: () => set({ notifications: [] }),

      // Global loading
      setGlobalLoading: loading => set({ globalLoading: loading }),

      // Filter actions
      setSearchQuery: query => set({ searchQuery: query, currentPage: 1 }),
      setSelectedDifficulty: difficulty =>
        set({ selectedDifficulty: difficulty, currentPage: 1 }),
      setSelectedTags: tags => set({ selectedTags: tags, currentPage: 1 }),
      setSelectedCompanies: companies =>
        set({ selectedCompanies: companies, currentPage: 1 }),
      setCurrentPage: page => set({ currentPage: page }),

      // Tag actions
      addTag: tag =>
        set(state => ({
          selectedTags: state.selectedTags.includes(tag)
            ? state.selectedTags
            : [...state.selectedTags, tag],
          currentPage: 1,
        })),
      removeTag: tag =>
        set(state => ({
          selectedTags: state.selectedTags.filter(t => t !== tag),
          currentPage: 1,
        })),
      clearTags: () => set({ selectedTags: [], currentPage: 1 }),

      // Company actions
      addCompany: company =>
        set(state => ({
          selectedCompanies: state.selectedCompanies.includes(company)
            ? state.selectedCompanies
            : [...state.selectedCompanies, company],
          currentPage: 1,
        })),
      removeCompany: company =>
        set(state => ({
          selectedCompanies: state.selectedCompanies.filter(c => c !== company),
          currentPage: 1,
        })),
      clearCompanies: () => set({ selectedCompanies: [], currentPage: 1 }),

      // Clear all filters
      clearAllFilters: () =>
        set({
          searchQuery: '',
          selectedDifficulty: 'all',
          selectedTags: [],
          selectedCompanies: [],
          currentPage: 1,
        }),

      // Code editor actions
      setSelectedLanguage: language => set({ selectedLanguage: language }),
      setEditorTheme: theme =>
        set({
          editorTheme: theme,
          codeEditorSettings: { ...get().codeEditorSettings, theme },
        }),
      setFontSize: size =>
        set({
          fontSize: size,
          codeEditorSettings: { ...get().codeEditorSettings, fontSize: size },
        }),
      updateCodeEditorSettings: settings =>
        set(state => ({
          codeEditorSettings: { ...state.codeEditorSettings, ...settings },
        })),

      // Reset UI state
      resetUIState: () =>
        set({
          isSidebarOpen: false,
          menuOpen: false,
          modals: {
            delete: false,
            edit: false,
            add: false,
            settings: false,
            profile: false,
          },
          notifications: [],
          globalLoading: false,
          searchQuery: '',
          selectedDifficulty: 'all',
          selectedTags: [],
          selectedCompanies: [],
          currentPage: 1,
        }),
    }),
    {
      name: 'ui-storage',
      partialize: state => ({
        selectedLanguage: state.selectedLanguage,
        editorTheme: state.editorTheme,
        fontSize: state.fontSize,
        codeEditorSettings: state.codeEditorSettings,
        selectedDifficulty: state.selectedDifficulty,
      }),
    }
  )
);
