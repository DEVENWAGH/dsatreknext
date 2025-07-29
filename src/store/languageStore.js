import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';

// Optimized language data - only store essential info
const LANGUAGES = {
  63: {
    name: 'JavaScript (Node.js 12.14.0)',
    key: 'JAVASCRIPT',
    icon: 'js',
    monaco: 'javascript',
  },
  71: { name: 'Python (3.8.1)', key: 'PYTHON', icon: 'py', monaco: 'python' },
  54: { name: 'C++ (GCC 9.2.0)', key: 'CPP', icon: 'cpp', monaco: 'cpp' },
  50: { name: 'C (GCC 9.2.0)', key: 'C', icon: 'c', monaco: 'c' },
  62: {
    name: 'Java (OpenJDK 13.0.1)',
    key: 'JAVA',
    icon: 'java',
    monaco: 'java',
  },
  51: {
    name: 'C# (Mono 6.6.0.161)',
    key: 'CSHARP',
    icon: 'cs',
    monaco: 'csharp',
  },
  74: {
    name: 'TypeScript (3.7.4)',
    key: 'TYPESCRIPT',
    icon: 'ts',
    monaco: 'typescript',
  },
  60: { name: 'Go (1.13.5)', key: 'GO', icon: 'go', monaco: 'go' },
  73: { name: 'Rust (1.40.0)', key: 'RUST', icon: 'rust', monaco: 'rust' },
  72: { name: 'Ruby (2.7.0)', key: 'RUBY', icon: 'ruby', monaco: 'ruby' },
};

// Generate icon URL
const getIcon = icon => `https://skillicons.dev/icons?i=${icon}`;

// Default languages
const DEFAULT_IDS = [63, 71, 54, 50, 62, 51, 74, 60, 73, 72];

export const useLanguageStore = create(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Core state
        selectedLanguages: DEFAULT_IDS,
        currentLanguage: 63,

        // Actions
        setCurrentLanguage: id => set({ currentLanguage: id }),
        setSelectedLanguages: ids => set({ selectedLanguages: ids }),

        // Selectors (computed values)
        getLanguage: id => LANGUAGES[id],
        getCurrentLanguage: () => LANGUAGES[get().currentLanguage],
        getSelectedLanguages: () =>
          get().selectedLanguages.map(id => ({ id, ...LANGUAGES[id] })),

        // Admin format
        getAdminLanguages: () =>
          get().selectedLanguages.map(id => ({
            key: LANGUAGES[id].key,
            displayName: LANGUAGES[id].key,
            name: LANGUAGES[id].name,
            icon: getIcon(LANGUAGES[id].icon),
            monacoLanguage: LANGUAGES[id].monaco,
          })),

        // Legacy support
        getLanguageIdByDisplayName: key => {
          const entry = Object.entries(LANGUAGES).find(
            ([, lang]) => lang.key === key
          );
          return entry ? parseInt(entry[0]) : null;
        },

        getLanguageById: id => LANGUAGES[id] || null,
        getLanguageDisplayName: id => LANGUAGES[id]?.key || 'Unknown',
        getLanguageDisplayNameByKey: key => {
          // For language keys like "JAVASCRIPT", "PYTHON", return them as-is or get prettier names
          const languageMap = {
            JAVASCRIPT: 'JavaScript',
            PYTHON: 'Python',
            CPP: 'C++',
            C: 'C',
            JAVA: 'Java',
            CSHARP: 'C#',
            TYPESCRIPT: 'TypeScript',
            GO: 'Go',
            RUST: 'Rust',
          };
          return languageMap[key] || key;
        },
        getAllLanguages: () =>
          Object.entries(LANGUAGES).map(([id, lang]) => ({
            id: parseInt(id),
            ...lang,
          })),
        getDefaultSelectedLanguages: () =>
          DEFAULT_IDS.map(id => ({
            id,
            displayName: LANGUAGES[id].key,
            name: LANGUAGES[id].name,
          })),
        getPopularLanguages: () =>
          DEFAULT_IDS.map(id => ({
            id,
            displayName: LANGUAGES[id].key,
            name: LANGUAGES[id].name,
          })),
        getSupportedLanguagesForAdmin: () => get().getAdminLanguages(),
        getLegacyLanguageId: key => get().getLanguageIdByDisplayName(key),
      }),
      {
        name: 'language-store',
        partialize: state => ({
          selectedLanguages: state.selectedLanguages,
          currentLanguage: state.currentLanguage,
        }),
      }
    )
  )
);

// Optimized selectors
export const useCurrentLanguage = () =>
  useLanguageStore(state => state.getCurrentLanguage(), shallow);
export const useSelectedLanguages = () =>
  useLanguageStore(state => state.getSelectedLanguages(), shallow);
export const useAdminLanguages = () =>
  useLanguageStore(state => state.getAdminLanguages(), shallow);

// Legacy exports for backward compatibility
export const JUDGE0_LANGUAGES = Object.fromEntries(
  Object.entries(LANGUAGES).map(([id, lang]) => [
    id,
    { name: lang.name, displayName: lang.key, icon: getIcon(lang.icon) },
  ])
);
export const DEFAULT_SELECTED_LANGUAGES = DEFAULT_IDS.map(id => ({
  id,
  displayName: LANGUAGES[id].key,
  name: LANGUAGES[id].name,
}));
