import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      selectedItems: [], // Danh sách ID sản phẩm được chọn
      
      addToCart: (product, quantity = 1) => {
        const items = get().items;
        const existingItem = items.find(item => item._id === product._id);
        
        if (existingItem) {
          set({
            items: items.map(item =>
              item._id === product._id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({ items: [...items, { ...product, quantity }] });
        }
      },
      
      removeFromCart: (productId) => {
        set({ 
          items: get().items.filter(item => item._id !== productId),
          selectedItems: get().selectedItems.filter(id => id !== productId)
        });
      },
      
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
      
      clearCart: () => {
        set({ items: [], selectedItems: [] });
      },
      
      // Chọn/bỏ chọn sản phẩm
      toggleSelectItem: (productId) => {
        const selectedItems = get().selectedItems;
        if (selectedItems.includes(productId)) {
          set({ selectedItems: selectedItems.filter(id => id !== productId) });
        } else {
          set({ selectedItems: [...selectedItems, productId] });
        }
      },
      
      // Chọn tất cả sản phẩm của một shop
      selectAllShopItems: (shopId) => {
        const items = get().items;
        const shopItemIds = items
          .filter(item => item.shop?._id === shopId)
          .map(item => item._id);
        
        const selectedItems = get().selectedItems;
        const newSelectedItems = [...new Set([...selectedItems, ...shopItemIds])];
        set({ selectedItems: newSelectedItems });
      },
      
      // Bỏ chọn tất cả sản phẩm của một shop
      deselectAllShopItems: (shopId) => {
        const items = get().items;
        const shopItemIds = items
          .filter(item => item.shop?._id === shopId)
          .map(item => item._id);
        
        const selectedItems = get().selectedItems;
        const newSelectedItems = selectedItems.filter(id => !shopItemIds.includes(id));
        set({ selectedItems: newSelectedItems });
      },
      
      // Kiểm tra tất cả sản phẩm của shop có được chọn không
      isAllShopItemsSelected: (shopId) => {
        const items = get().items;
        const selectedItems = get().selectedItems;
        const shopItemIds = items
          .filter(item => item.shop?._id === shopId)
          .map(item => item._id);
        
        return shopItemIds.length > 0 && shopItemIds.every(id => selectedItems.includes(id));
      },
      
      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      
      // Tính tổng chỉ những sản phẩm được chọn
      getSelectedTotal: () => {
        const selectedItems = get().selectedItems;
        return get().items
          .filter(item => selectedItems.includes(item._id))
          .reduce((total, item) => total + item.price * item.quantity, 0);
      },
      
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
      
      // Lấy danh sách sản phẩm được chọn
      getSelectedItems: () => {
        const selectedItems = get().selectedItems;
        return get().items.filter(item => selectedItems.includes(item._id));
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

export default useCartStore;
