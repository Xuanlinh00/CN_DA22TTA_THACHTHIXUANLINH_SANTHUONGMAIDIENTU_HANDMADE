import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ========== STORE XÁC THỰC NGƯỜI DÙNG ==========
// Quản lý thông tin user, token, và trạng thái đăng nhập
// Sử dụng Zustand + localStorage để lưu trữ persistent
const useAuthStore = create(
  persist(
    (set) => ({
      // ========== STATE ==========
      user: null,           // Thông tin người dùng hiện tại
      token: null,          // JWT token
      isAuthenticated: false, // Trạng thái đăng nhập
      
      // ========== ACTIONS ==========
      /**
       * Lưu thông tin xác thực người dùng
       * @param {Object} user - Thông tin người dùng
       * @param {string} token - JWT token
       */
      setAuth: (user, token) => {
        localStorage.setItem('token', token);
        // Lưu shopId nếu user là shop owner (dùng cho quick access)
        if (user?.role === 'shop_owner' && user?.shop?._id) {
          localStorage.setItem('shopId', user.shop._id);
        } else {
          localStorage.removeItem('shopId');
        }
        set({ user, token, isAuthenticated: true });
      },
      
      /**
       * Cập nhật thông tin người dùng
       * @param {Object} userData - Dữ liệu cần cập nhật
       */
      updateUser: (userData) => {
        set((state) => ({ user: { ...state.user, ...userData } }));
      },
      
      /**
       * Đăng xuất người dùng
       */
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('shopId');
        set({ user: null, token: null, isAuthenticated: false });
      },
      
      /**
       * Kiểm tra người dùng có phải admin không
       * @returns {boolean}
       */
      isAdmin: () => {
        const state = useAuthStore.getState();
        return state.user?.role === 'admin';
      },
      
      /**
       * Kiểm tra người dùng có phải shop owner không
       * @returns {boolean}
       */
      isShopOwner: () => {
        const state = useAuthStore.getState();
        return state.user?.role === 'shop_owner';
      },
      
      /**
       * Kiểm tra người dùng có phải user thường không
       * @returns {boolean}
       */
      isUser: () => {
        const state = useAuthStore.getState();
        return state.user?.role === 'user';
      },
    }),
    {
      name: 'auth-storage', // Tên key trong localStorage
    }
  )
);

export default useAuthStore;
