import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiMapPin, FiTruck, FiCreditCard } from 'react-icons/fi';
import useCartStore from '../stores/cartStore';
import useAuthStore from '../stores/authStore';
import { orderService } from '../services/orderService';
import { paymentService } from '../services/paymentService';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { items: cartItems, getTotal: getCartTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [shippingFee] = useState(30000); // Mock shipping fee
  const [items, setItems] = useState([]);
  const [isTempCart, setIsTempCart] = useState(false);

  // Kiểm tra xem có "Mua ngay" từ sessionStorage không
  useEffect(() => {
    const tempCart = sessionStorage.getItem('tempCart');
    if (tempCart) {
      try {
        const parsedCart = JSON.parse(tempCart);
        setItems(parsedCart);
        setIsTempCart(true);
      } catch (error) {
        console.error('Lỗi parse tempCart:', error);
        setItems(cartItems);
        setIsTempCart(false);
      }
    } else {
      setItems(cartItems);
      setIsTempCart(false);
    }
  }, [cartItems]);

  // Kiểm tra giỏ hàng trống và redirect
  useEffect(() => {
    if (items.length === 0 && !sessionStorage.getItem('tempCart')) {
      navigate('/cart');
    }
  }, [items, navigate]);
  
  const getTotal = () => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Helper function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/default-product-tiny.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    // Remove /api from the URL if present, since images are served at /uploads not /api/uploads
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '');
    return `${baseUrl}${imagePath}`;
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
      street: '',
      ward: '',
      district: '',
      city: '',
      paymentMethod: 'COD',
      shippingMethod: 'standard',
    },
  });

  // Watch form fields để kiểm tra địa chỉ đã điền đủ chưa
  const formData = watch();
  const isAddressComplete = formData.fullName && formData.phone && formData.street && formData.ward && formData.district && formData.city;
  const calculatedShippingFee = isAddressComplete ? 30000 : 0;

  const onSubmit = async (data) => {
    if (!items || items.length === 0) {
      toast.error('Giỏ hàng trống');
      return;
    }

    // Debug: Kiểm tra token
    const token = localStorage.getItem('token');
    console.log('🔐 Token:', token ? '✅ Có' : '❌ Không có');
    console.log('👤 User:', user);

    setIsLoading(true);
    try {
      const tempCart = sessionStorage.getItem('tempCart');
      const isTemp = !!tempCart;

      const orderData = {
        items: items.map(item => ({
          product: item._id,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: {
          fullName: data.fullName,
          phone: data.phone,
          street: data.street,
          ward: data.ward,
          district: data.district,
          city: data.city,
        },
        paymentMethod: data.paymentMethod,
        shippingMethod: data.shippingMethod,
        shippingFee: calculatedShippingFee,
        totalPrice: getTotal() + calculatedShippingFee,
      };

      const response = await orderService.create(orderData);
      const orderId = response.data._id;
      
      // Xóa giỏ hàng
      if (isTemp) {
        sessionStorage.removeItem('tempCart');
      } else {
        clearCart();
      }

      // Xử lý thanh toán
      if (data.paymentMethod === 'VNPAY') {
        // Tạo URL thanh toán VNPAY
        const paymentResponse = await paymentService.createVNPayPayment(orderId);
        window.location.href = paymentResponse.data.paymentUrl;
      } else {
        // COD - Chuyển thẳng đến trang đơn hàng
        toast.success('Đặt hàng thành công!');
        navigate(`/orders/${orderId}`);
      }
    } catch (error) {
      console.error('❌ Lỗi đặt hàng:', error);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      
      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        // Không redirect tự động, để user có cơ hội thấy lỗi
      } else {
        toast.error(error.response?.data?.message || 'Đặt hàng thất bại');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Nếu giỏ hàng trống, không render gì
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-sans font-bold text-primary-900 mb-8">
        Thanh toán
      </h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-primary-900 mb-4 flex items-center">
                <FiMapPin className="mr-2" />
                Địa chỉ giao hàng
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Họ và tên *
                  </label>
                  <input
                    {...register('fullName', { required: 'Họ tên là bắt buộc' })}
                    className="input-field"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Số điện thoại *
                  </label>
                  <input
                    {...register('phone', {
                      required: 'Số điện thoại là bắt buộc',
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: 'Số điện thoại không hợp lệ',
                      },
                    })}
                    className="input-field"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Địa chỉ cụ thể *
                  </label>
                  <input
                    {...register('street', { required: 'Địa chỉ là bắt buộc' })}
                    className="input-field"
                    placeholder="Số nhà, tên đường"
                  />
                  {errors.street && (
                    <p className="mt-1 text-sm text-red-600">{errors.street.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Phường/Xã *
                  </label>
                  <input
                    {...register('ward', { required: 'Phường/Xã là bắt buộc' })}
                    className="input-field"
                  />
                  {errors.ward && (
                    <p className="mt-1 text-sm text-red-600">{errors.ward.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Quận/Huyện *
                  </label>
                  <input
                    {...register('district', { required: 'Quận/Huyện là bắt buộc' })}
                    className="input-field"
                  />
                  {errors.district && (
                    <p className="mt-1 text-sm text-red-600">{errors.district.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Tỉnh/Thành phố *
                  </label>
                  <input
                    {...register('city', { required: 'Tỉnh/Thành phố là bắt buộc' })}
                    className="input-field"
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Method */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-primary-900 mb-4 flex items-center">
                <FiTruck className="mr-2" />
                Phương thức vận chuyển
              </h2>

              <div className="space-y-3">
                {!isAddressComplete && (
                  <p className="text-sm text-primary-600 mb-3">
                    ⚠️ Vui lòng điền đầy đủ địa chỉ để tính phí vận chuyển
                  </p>
                )}
                <label className="flex items-center p-4 border border-primary-300 rounded-lg cursor-pointer hover:bg-primary-50">
                  <input
                    type="radio"
                    {...register('shippingMethod')}
                    value="standard"
                    className="mr-3"
                    disabled={!isAddressComplete}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-primary-900">Giao hàng tiêu chuẩn</p>
                    <p className="text-sm text-primary-600">3-5 ngày</p>
                  </div>
                  <span className="font-semibold text-primary-900">
                    {isAddressComplete ? formatCurrency(calculatedShippingFee) : 'Chưa tính'}
                  </span>
                </label>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-primary-900 mb-4 flex items-center">
                <FiCreditCard className="mr-2" />
                Phương thức thanh toán
              </h2>

              <div className="space-y-3">
                <label className="flex items-center p-4 border border-primary-300 rounded-lg cursor-pointer hover:bg-primary-50">
                  <input
                    type="radio"
                    {...register('paymentMethod')}
                    value="COD"
                    className="mr-3"
                    defaultChecked
                  />
                  <div>
                    <p className="font-medium text-primary-900">Thanh toán khi nhận hàng (COD)</p>
                    <p className="text-sm text-primary-600">Thanh toán bằng tiền mặt khi nhận hàng</p>
                  </div>
                </label>

                <label className="flex items-center p-4 border border-primary-300 rounded-lg cursor-pointer hover:bg-primary-50">
                  <input
                    type="radio"
                    {...register('paymentMethod')}
                    value="VNPAY"
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <div>
                      <p className="font-medium text-primary-900">Thanh toán qua VNPAY</p>
                      <p className="text-sm text-primary-600">Thanh toán bằng thẻ ATM, Visa, MasterCard</p>
                    </div>
                    <img 
                      src="https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418196384.png" 
                      alt="VNPAY" 
                      className="h-8 ml-auto"
                    />
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-20">
              <h2 className="text-xl font-semibold text-primary-900 mb-4">
                Đơn hàng
              </h2>

              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item._id} className="flex gap-3">
                    <img
                      src={getImageUrl(item.images?.[0])}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-primary-900 line-clamp-2">
                        {item.name}
                      </p>
                      <p className="text-sm text-primary-600">x{item.quantity}</p>
                      <p className="text-sm font-semibold text-accent-600">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-primary-200 pt-4">
                <div className="flex justify-between text-primary-700">
                  <span>Tạm tính</span>
                  <span>{formatCurrency(getTotal())}</span>
                </div>
                <div className="flex justify-between text-primary-700">
                  <span>Phí vận chuyển</span>
                  <span>{isAddressComplete ? formatCurrency(calculatedShippingFee) : 'Chưa tính'}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-primary-900 border-t border-primary-200 pt-3">
                  <span>Tổng cộng</span>
                  <span className="text-accent-600">
                    {isAddressComplete ? formatCurrency(getTotal() + calculatedShippingFee) : formatCurrency(getTotal())}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !isAddressComplete}
                className="w-full btn-primary mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!isAddressComplete ? 'Điền đầy đủ địa chỉ để tiếp tục' : isLoading ? 'Đang xử lý...' : 'Đặt hàng'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
