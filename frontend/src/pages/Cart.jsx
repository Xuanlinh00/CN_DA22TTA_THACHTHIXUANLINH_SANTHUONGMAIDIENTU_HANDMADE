import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiZap } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import useAuthStore from '../stores/authStore';
import useCartStore from '../stores/cartStore';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    getTotal, 
    clearCart,
    selectedItems,
    toggleSelectItem,
    selectAllShopItems,
    deselectAllShopItems,
    isAllShopItemsSelected,
    getSelectedTotal,
    getSelectedItems
  } = useCartStore();

  // Admin không có giỏ hàng, redirect sang admin dashboard
  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin');
    }
  }, [user?.role, navigate]);

  const itemsByShop = items.reduce((acc, item) => {
    const shopId = item.shop?._id || 'unknown';
    if (!acc[shopId]) {
      acc[shopId] = { shop: item.shop, items: [] };
    }
    acc[shopId].items.push(item);
    return acc;
  }, {});

  const handleBuyNow = (item) => {
    sessionStorage.setItem('tempCart', JSON.stringify([item]));
    navigate('/checkout');
  };

  const handleBuyShop = (shopId) => {
    sessionStorage.setItem('tempCart', JSON.stringify(itemsByShop[shopId].items));
    navigate('/checkout');
  };

  const handleCheckoutSelected = () => {
    const selected = getSelectedItems();
    if (selected.length === 0) {
      toast.error('Vui lòng chọn ít nhất một sản phẩm');
      return;
    }
    sessionStorage.setItem('tempCart', JSON.stringify(selected));
    navigate('/checkout');
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/default-product-small.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '');
    return `${baseUrl}${imagePath}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-sans font-bold text-primary-900 mb-8">
        Giỏ hàng của tôi
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <FiShoppingBag className="mx-auto text-primary-300 mb-4" size={80} />
          <h2 className="text-2xl font-bold text-primary-900 mb-4">Giỏ hàng trống</h2>
          <p className="text-primary-600 mb-8">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
          <Link to="/products" className="btn-primary">Khám phá sản phẩm</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(itemsByShop).map(([shopId, { shop, items: shopItems }]) => (
              <div key={shopId} className="card overflow-hidden">
                <div className="bg-primary-50 p-4 border-b border-primary-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isAllShopItemsSelected(shopId)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          selectAllShopItems(shopId);
                        } else {
                          deselectAllShopItems(shopId);
                        }
                      }}
                      className="w-5 h-5 cursor-pointer"
                    />
                    <img src={shop?.avatar || '/default-shop-avatar.jpg'} alt={shop?.shopName} className="w-10 h-10 rounded-full object-cover" />
                    <Link to={`/shops/${shop?._id}`} className="font-semibold text-primary-900 hover:text-primary-700">
                      {shop?.shopName || 'Cửa hàng'}
                    </Link>
                  </div>
                  <button onClick={() => handleBuyShop(shopId)} className="btn-secondary flex items-center gap-2 text-sm">
                    <FiZap size={16} />
                    Mua tất cả
                  </button>
                </div>

                <div className="space-y-3 p-4">
                  {shopItems.map((item) => (
                    <div key={item._id} className="flex gap-4 pb-3 border-b border-primary-100 last:border-0 last:pb-0 items-start">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item._id)}
                        onChange={() => toggleSelectItem(item._id)}
                        className="w-5 h-5 cursor-pointer mt-1"
                      />
                      <img src={getImageUrl(item.images?.[0])} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                      <div className="flex-1">
                        <Link to={`/products/${item._id}`} className="font-semibold text-primary-900 hover:text-primary-700 line-clamp-2">
                          {item.name}
                        </Link>
                        <p className="text-lg font-bold text-accent-600 mt-1">{formatCurrency(item.price)}</p>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <button onClick={() => removeFromCart(item._id)} className="text-red-600 hover:text-red-700">
                          <FiTrash2 size={18} />
                        </button>
                        <div className="flex items-center space-x-1 border border-primary-300 rounded-lg">
                          <button onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))} className="p-1 hover:bg-primary-100">
                            <FiMinus size={14} />
                          </button>
                          <span className="px-3 font-medium text-sm">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="p-1 hover:bg-primary-100" disabled={item.quantity >= item.stock}>
                            <FiPlus size={14} />
                          </button>
                        </div>
                        <button onClick={() => handleBuyNow(item)} className="bg-accent-500 hover:bg-accent-600 text-white font-medium text-sm px-3 py-1.5 rounded flex items-center gap-1 mt-2 transition-colors">
                          <FiZap size={14} />
                          Mua ngay
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={clearCart} className="text-red-600 hover:text-red-700 font-medium">Xóa tất cả</button>
          </div>

          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-20">
              <h2 className="text-xl font-semibold text-primary-900 mb-4">Tổng đơn hàng</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-primary-700">
                  <span>Tạm tính</span>
                  <span>{formatCurrency(getSelectedTotal())}</span>
                </div>
                <div className="flex justify-between text-sm text-primary-600">
                  <span>({selectedItems.length} sản phẩm được chọn)</span>
                </div>
                <div className="flex justify-between text-primary-700">
                  <span>Phí vận chuyển</span>
                  <span className="text-sm">Tính sau</span>
                </div>
                <div className="border-t border-primary-200 pt-3 flex justify-between text-lg font-bold text-primary-900">
                  <span>Tổng cộng</span>
                  <span className="text-accent-600">{formatCurrency(getSelectedTotal())}</span>
                </div>
              </div>
              <button 
                onClick={handleCheckoutSelected}
                disabled={selectedItems.length === 0}
                className="w-full btn-primary mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Thanh toán ({selectedItems.length})
              </button>
              <Link to="/products" className="block text-center text-primary-700 hover:text-primary-900 font-medium">Tiếp tục mua sắm</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
