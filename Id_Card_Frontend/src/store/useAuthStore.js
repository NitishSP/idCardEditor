import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Root users who can perform sensitive operations
const ROOT_USERS = ["admin", "pixelVedaAdmin", "pixelVedaTesting", "pixelVedaLogin"];

const useAuthStore = create(
  persist(
    (set, get) => ({
      // Current logged-in user
      user: null,
      username: '',
      isAuthenticated: false,

      // Set user after successful login
      setUser: (userData) => {
        const username = userData?.username || '';
        set({
          user: userData,
          username,
          isAuthenticated: !!userData,
        });
      },

      // Clear user on logout
      clearUser: () => {
        set({
          user: null,
          username: '',
          isAuthenticated: false,
        });
      },

      // Check if current user is a root user
      isRootUser: () => {
        const { username } = get();
        return ROOT_USERS.includes(username);
      },

      // Get current username
      getUsername: () => {
        return get().username;
      },

      // Get root users list
      getRootUsers: () => {
        return ROOT_USERS;
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({
        user: state.user,
        username: state.username,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
