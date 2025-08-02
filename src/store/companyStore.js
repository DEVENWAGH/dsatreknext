import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { companyAPI } from '@/api/api';

const createCompanyMap = companies =>
  companies.reduce((acc, company) => {
    acc[company.id] = {
      name: company.name,
      url: company.company_url?.url || null,
    };
    return acc;
  }, {});

export const useCompanyStore = create(
  persist(
    (set, get) => ({
      companyMap: {},
      isLoading: false,

      getAllCompanies: async () => {
        const { companyMap } = get();
        if (Object.keys(companyMap).length > 0) return;

        set({ isLoading: true });
        try {
          const response = await companyAPI.getAll();
          const companies = response.data || [];
          set({ companyMap: createCompanyMap(companies) });
        } catch (error) {
          console.error('Error fetching companies:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      getCompanyFromCache: companyId => get().companyMap[companyId] || null,
    }),
    {
      name: 'company-storage',
      partialize: state => ({ companyMap: state.companyMap }),
    }
  )
);
