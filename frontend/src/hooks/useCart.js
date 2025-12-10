import { useEffect, useState } from 'react';
import api from '@/utils/api';
import toast from 'react-hot-toast';

export default function useCart() {
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/cart');
      if (res?.data?.data) setCart(res.data.data);
    } catch {
      toast.error('Không lấy được giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      const res = await api.post('/api/cart/add', { productId, quantity });
      if (res?.data?.data) {
        setCart(res.data.data);
        toast.success('Đã thêm vào giỏ');
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Lỗi thêm giỏ');
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const res = await api.delete(`/api/cart/remove/${productId}`);
      if (res?.data?.data) {
        setCart(res.data.data);
        toast.success('Đã xoá sản phẩm');
      }
    } catch {
      toast.error('Không xoá được');
    }
  };

  useEffect(() => { fetchCart(); }, []);

  return { cart, loading, addToCart, removeFromCart, refresh: fetchCart };
}
