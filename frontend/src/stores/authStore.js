import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      setAuth: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
      },
      
      updateUser: (userData) => {
        set((state) => ({ user: { ...state.user, ...userData } }));
      },
      
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },
      
      isAdmin: () => {
        const state = useAuthStore.getState();
        return state.user?.role === 'admin';
      },
      
      isShopOwner: () => {
        const state = useAuthStore.getState();
        return state.user?.role === 'shop_owner';
      },
      
      isUser: () => {
        const state = useAuthStore.getState();
        return state.user?.role === 'user';
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;
