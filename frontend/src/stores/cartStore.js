import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ========== STORE GIỎ HÀNG ==========
// Quản lý sản phẩm trong giỏ hàng, tính toán tổng tiền
// Hỗ trợ chọn/bỏ chọn sản phẩm theo shop
const useCartStore = create(
  persist(
    (set, get) => ({
      // ========== STATE ==========
      items: [],              // Danh sách sản phẩm trong giỏ
      selectedItems: [],      // Danh sách ID sản phẩm được chọn
      
      // ========== ACTIONS ==========
      /**
       * Thêm sản phẩm vào giỏ hàng
       * @param {Object} product - Thông tin sản phẩm
       * @param {number} quantity - Số lượng (mặc định 1)
       */
      addToCart: (product, quantity = 1) => {
        const items = get().items;
        const existingItem = items.find(item => item._id === product._id);
        
        if (existingItem) {
          // Nếu sản phẩm đã có, tăng số lượng
          set({
            items: items.map(item =>
              item._id === product._id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          // Nếu sản phẩm chưa có, thêm mới
          set({ items: [...items, { ...product, quantity }] });
        }
      },
      
      /**
       * Xóa sản phẩm khỏi giỏ hàng
       * @param {string} productId - ID sản phẩm
       */
      removeFromCart: (productId) => {
        set({ 
          items: get().items.filter(item => item._id !== productId),
          selectedItems: get().selectedItems.filter(id => id !== productId)
        });
      },
      
      /**
       * Cập nhật số lượng sản phẩm
       * @param {string} productId - ID sản phẩm
       * @param {number} quantity - Số lượng mới
       */
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        set({
          items: get().items.map(item =>
            item._id === productId ? { ...item, quantity } : item
          ),
        });
      },
      
      /**
       * Xóa tất cả sản phẩm trong giỏ hàng
       */
      clearCart: () => {
        set({ items: [], selectedItems: [] });
      },
      
      /**
       * Chọn/bỏ chọn một sản phẩm
       * @param {string} productId - ID sản phẩm
       */
      toggleSelectItem: (productId) => {
        const selectedItems = get().selectedItems;
        if (selectedItems.includes(productId)) {
          set({ selectedItems: selectedItems.filter(id => id !== productId) });
        } else {
          set({ selectedItems: [...selectedItems, productId] });
        }
      },
      
      /**
       * Chọn tất cả sản phẩm của một shop
       * @param {string} shopId - ID shop
       */
      selectAllShopItems: (shopId) => {
        const items = get().items;
        const shopItemIds = items
          .filter(item => item.shop?._id === shopId)
          .map(item => item._id);
        
        const selectedItems = get().selectedItems;
        const newSelectedItems = [...new Set([...selectedItems, ...shopItemIds])];
        set({ selectedItems: newSelectedItems });
      },
      
      /**
       * Bỏ chọn tất cả sản phẩm của một shop
       * @param {string} shopId - ID shop
       */
      deselectAllShopItems: (shopId) => {
        const items = get().items;
        const shopItemIds = items
          .filter(item => item.shop?._id === shopId)
          .map(item => item._id);
        
        const selectedItems = get().selectedItems;
        const newSelectedItems = selectedItems.filter(id => !shopItemIds.includes(id));
        set({ selectedItems: newSelectedItems });
      },
      
      /**
       * Kiểm tra tất cả sản phẩm của shop có được chọn không
       * @param {string} shopId - ID shop
       * @returns {boolean}
       */
      isAllShopItemsSelected: (shopId) => {
        const items = get().items;
        const selectedItems = get().selectedItems;
        const shopItemIds = items
          .filter(item => item.shop?._id === shopId)
          .map(item => item._id);
        
        return shopItemIds.length > 0 && shopItemIds.every(id => selectedItems.includes(id));
      },
      
      /**
       * Tính tổng tiền tất cả sản phẩm trong giỏ
       * @returns {number}
       */
      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      
      /**
       * Tính tổng tiền chỉ những sản phẩm được chọn
       * @returns {number}
       */
      getSelectedTotal: () => {
        const selectedItems = get().selectedItems;
        return get().items
          .filter(item => selectedItems.includes(item._id))
          .reduce((total, item) => total + item.price * item.quantity, 0);
      },
      
      /**
       * Lấy tổng số lượng sản phẩm trong giỏ
       * @returns {number}
       */
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
      
      /**
       * Lấy danh sách sản phẩm được chọn
       * @returns {Array}
       */
      getSelectedItems: () => {
        const selectedItems = get().selectedItems;
        return get().items.filter(item => selectedItems.includes(item._id));
      },
    }),
    {
      name: 'cart-storage', // Tên key trong localStorage
    }
  )
);

export default useCartStore;
