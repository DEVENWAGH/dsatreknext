import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { adminAPI, authAPI } from '@/api/api';
import { toast } from 'sonner';

export const useAdminStore = create(
  persist(
    (set, get) => ({
      // State
      users: [],
      userMap: {},
      totalStats: {
        totalUsers: 0,
        totalProblems: 0,
        totalSubmissions: 0,
        totalAcceptedSubmissions: 0,
      },
      isLoading: false,
      isLoadingStats: false,
      isUpdatingUser: false,
      error: null,
      _statsPromise: null,
      _usersPromise: null,

      // Get all users with deduplication
      getAllUsers: async (params = {}) => {
        const state = get();

        // Return existing promise if already fetching
        if (state._usersPromise) {
          return state._usersPromise;
        }

        const promise = (async () => {
          set({ isLoading: true, error: null });
          try {
            const response = await adminAPI.getAllUsers(params);
            const users = response.data?.data || response.data || [];
            const pagination = response.data?.pagination || null;

            // Create user map for quick lookups
            const userMap = users.reduce((acc, user) => {
              acc[user.id] = user;
              return acc;
            }, {});

            set({
              users,
              userMap,
              isLoading: false,
              _usersPromise: null,
            });

            return { data: users, pagination };
          } catch (error) {
            set({
              error: error.message,
              isLoading: false,
              _usersPromise: null,
            });
            console.error('Error fetching users:', error);
            return null;
          }
        })();

        set({ _usersPromise: promise });
        return promise;
      },

      // Change user role
      changeRole: async userId => {
        set({ isUpdatingUser: true, error: null });
        try {
          const response = await adminAPI.changeRole(userId);

          if (response.success) {
            // Update user in both users array and userMap
            const updatedUser = response.data;

            set(state => ({
              users: state.users.map(user =>
                user.id === userId ? updatedUser : user
              ),
              userMap: {
                ...state.userMap,
                [userId]: updatedUser,
              },
              isUpdatingUser: false,
            }));

            return { data: { success: true, message: response.message } };
          }

          return response;
        } catch (error) {
          set({ error: error.message, isUpdatingUser: false });
          console.error('Error changing user role:', error);
          throw error;
        }
      },

      // Get admin statistics with caching
      getTotalStats: async (forceRefresh = false) => {
        const state = get();

        // Return cached data if available and not forcing refresh
        if (!forceRefresh && state.totalStats.totalUsers > 0) {
          return state.totalStats;
        }

        // Return existing promise if already fetching
        if (state._statsPromise) {
          return state._statsPromise;
        }

        const promise = (async () => {
          set({ isLoadingStats: true, error: null });
          try {
            const response = await authAPI.total();
            const stats = response.data;

            set({
              totalStats: stats,
              isLoadingStats: false,
              _statsPromise: null,
            });

            return stats;
          } catch (error) {
            set({
              error: error.message,
              isLoadingStats: false,
              _statsPromise: null,
            });
            console.error('Error fetching admin stats:', error);
            return get().totalStats; // Return cached data on error
          }
        })();

        set({ _statsPromise: promise });
        return promise;
      },

      // Update user
      updateUser: async (userId, userData) => {
        set({ isUpdatingUser: true, error: null });
        try {
          const response = await adminAPI.updateUser(userId, userData);
          const updatedUser = response.data.data;

          set(state => ({
            users: state.users.map(user =>
              user.id === userId ? updatedUser : user
            ),
            userMap: {
              ...state.userMap,
              [userId]: updatedUser,
            },
            isUpdatingUser: false,
          }));

          toast.success('User updated successfully');
          return updatedUser;
        } catch (error) {
          set({ error: error.message, isUpdatingUser: false });
          console.error('Error updating user:', error);
          toast.error('Failed to update user');
          throw error;
        }
      },

      // Delete user
      deleteUser: async userId => {
        set({ isUpdatingUser: true, error: null });
        try {
          await adminAPI.deleteUser(userId);

          set(state => {
            const newUserMap = { ...state.userMap };
            delete newUserMap[userId];

            return {
              users: state.users.filter(user => user.id !== userId),
              userMap: newUserMap,
              isUpdatingUser: false,
            };
          });

          toast.success('User deleted successfully');
        } catch (error) {
          set({ error: error.message, isUpdatingUser: false });
          console.error('Error deleting user:', error);
          toast.error('Failed to delete user');
          throw error;
        }
      },

      // Get user from cache
      getUserFromCache: userId => {
        return get().userMap[userId] || null;
      },

      // Clear admin data
      clearAdminData: () => {
        set({
          users: [],
          userMap: {},
          totalStats: {
            totalUsers: 0,
            totalProblems: 0,
            totalSubmissions: 0,
            totalAcceptedSubmissions: 0,
          },
        });
      },
    }),
    {
      name: 'admin-storage',
      partialize: state => ({
        totalStats: state.totalStats,
      }),
    }
  )
);
