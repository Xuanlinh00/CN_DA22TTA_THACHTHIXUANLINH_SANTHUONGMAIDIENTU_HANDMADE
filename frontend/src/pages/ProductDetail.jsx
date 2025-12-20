import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiShoppingCart, FiStar, FiMapPin, FiPackage, FiUser } from 'react-icons/fi';
import { productService } from '../services/productService';
import useCartStore from '../stores/cartStore';
import useAuthStore from '../stores/authStore';
import { formatCurrency } from '../utils/formatters';
import Loading from '../components/common/Loading';
import ProductCard from '../components/common/ProductCard';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getById(id),
  });

  const product = data?.data;

  // Fetch related products (same category)
  const { data: relatedData } = useQuery({
    queryKey: ['related-products', product?.category?._id],
    queryFn: () => productService.getAll({ 
      category: product?.category?._id, 
      limit: 6 
    }),
    enabled: !!product?.category?._id,
  });

  // Fetch user's orders to check if they bought this product
  const { data: ordersData } = useQuery({
    queryKey: ['user-orders-for-review', id],
    queryFn: async () => {
      const response = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      return response.json();
    },
    enabled: isAuthenticated && !!id,
  });

  // Helper function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/default-product-large.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    // Remove /api from the URL if present, since images are served at /uploads not /api/uploads
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '');
    return `${baseUrl}${imagePath}`;
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      navigate('/login');
      return;
    }
    
    if (product) {
      addToCart(product, quantity);
      toast.success('Đã thêm vào giỏ hàng');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedOrder) {
      toast.error('Vui lòng chọn đơn hàng');
      return;
    }

    try {
      const response = await fetch(`/api/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          rating: reviewData.rating,
          comment: reviewData.comment,
          orderId: selectedOrder
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Đánh giá đã được gửi');
        setShowReviewForm(false);
        setReviewData({ rating: 5, comment: '' });
        setSelectedOrder(null);
        // Reload product data
        window.location.reload();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Lỗi khi gửi đánh giá');
    }
  };

  if (isLoading) return <Loading fullScreen />;
  if (!product) return <div className="container mx-auto px-4 py-20 text-center">Không tìm thấy sản phẩm</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 text-sm text-primary-600">
        <Link to="/" className="hover:text-primary-900">Trang chủ</Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-primary-900">Sản phẩm</Link>
        <span className="mx-2">/</span>
        <span className="text-primary-900">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          <div className="card overflow-hidden mb-4">
            <img
              src={getImageUrl(product.images?.[selectedImage])}
              alt={product.name}
              className="w-full aspect-square object-cover"
            />
          </div>
          {product.images?.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`card overflow-hidden ${
                    selectedImage === idx ? 'ring-2 ring-primary-700' : ''
                  }`}
                >
                  <img src={getImageUrl(img)} alt="" className="w-full aspect-square object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-sans font-bold text-primary-900 mb-4">
            {product.name}
          </h1>

          {/* Rating */}
          {product.rating > 0 && (
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className={i < Math.floor(product.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                  />
                ))}
              </div>
              <span className="text-primary-700 font-medium">{product.rating.toFixed(1)}</span>
              <span className="text-primary-500">({product.numReviews || 0} đánh giá)</span>
            </div>
          )}

          {/* Price */}
          <div className="mb-6">
            <span className="text-4xl font-bold text-accent-600">
              {formatCurrency(product.price)}
            </span>
          </div>

          {/* Shop Info */}
          <Link
            to={`/shops/${product.shop?._id}`}
            className="flex items-center space-x-3 p-4 bg-primary-50 rounded-lg mb-6 hover:bg-primary-100 transition-colors"
          >
            <img
              src={product.shop?.avatar || '/default-shop-avatar.jpg'}
              alt={product.shop?.shopName}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-primary-900">{product.shop?.shopName}</p>
              <p className="text-sm text-primary-600 flex items-center">
                <FiMapPin size={14} className="mr-1" />
                {product.shop?.address?.city}
              </p>
            </div>
          </Link>

          {/* Stock */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 text-primary-700">
              <FiPackage />
              <span>
                {product.stock > 0 ? (
                  <span className="text-green-600 font-medium">Còn {product.stock} sản phẩm</span>
                ) : (
                  <span className="text-red-600 font-medium">Hết hàng</span>
                )}
              </span>
            </div>
          </div>

          {/* Quantity */}
          {product.stock > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Số lượng
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-primary-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-primary-100"
                  >
                    -
                  </button>
                  <span className="px-6 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-4 py-2 hover:bg-primary-100"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 btn-primary flex items-center justify-center space-x-2"
            >
              <FiShoppingCart />
              <span>Thêm vào giỏ</span>
            </button>
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  toast.error('Vui lòng đăng nhập để mua hàng');
                  navigate('/login');
                  return;
                }
                if (product) {
                  const item = { ...product, quantity };
                  sessionStorage.setItem('tempCart', JSON.stringify([item]));
                  navigate('/checkout');
                }
              }}
              disabled={product.stock === 0}
              className="flex-1 bg-accent-500 hover:bg-accent-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <FiShoppingCart />
              <span>Mua ngay</span>
            </button>
          </div>

          {/* Description */}
          <div className="border-t border-primary-200 pt-6">
            <h2 className="text-xl font-semibold text-primary-900 mb-4">Mô tả sản phẩm</h2>
            <p className="text-primary-700 whitespace-pre-line">{product.description}</p>
          </div>

          {/* Material */}
          {product.material && (
            <div className="mt-6">
              <h3 className="font-semibold text-primary-900 mb-2">Chất liệu</h3>
              <p className="text-primary-700">{product.material}</p>
            </div>
          )}

          {/* Category */}
          {product.category && (
            <div className="mt-4">
              <h3 className="font-semibold text-primary-900 mb-2">Danh mục</h3>
              <Link
                to={`/products?category=${product.category._id}`}
                className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200"
              >
                {product.category.name}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16 border-t border-primary-200 pt-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-primary-900">Đánh giá sản phẩm</h2>
          {isAuthenticated && (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="btn-primary"
            >
              {showReviewForm ? 'Hủy' : 'Viết đánh giá'}
            </button>
          )}
        </div>

        {/* Review Form */}
        {showReviewForm && isAuthenticated && (
          <div className="card p-8 mb-8 bg-primary-50">
            <h3 className="text-lg font-semibold text-primary-900 mb-6">Viết đánh giá của bạn</h3>
            
            {/* Select Order */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Chọn đơn hàng *
              </label>
              <select
                value={selectedOrder || ''}
                onChange={(e) => setSelectedOrder(e.target.value)}
                className="w-full px-4 py-2.5 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">-- Chọn đơn hàng --</option>
                {ordersData?.data?.map((order) => {
                  const item = order.items.find(i => i.product === id);
                  if (!item || item.reviewed) return null;
                  return (
                    <option key={order._id} value={order._id}>
                      {order.orderNumber} - {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </option>
                  );
                })}
              </select>
            </div>

            <form onSubmit={handleSubmitReview}>
              {/* Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-primary-700 mb-3">
                  Đánh giá *
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewData({ ...reviewData, rating: star })}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <FiStar
                        size={32}
                        className={star <= reviewData.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  Nhận xét *
                </label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                  rows="4"
                  className="w-full px-4 py-2.5 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  required
                />
              </div>

              <button type="submit" className="btn-primary w-full">
                Gửi đánh giá
              </button>
            </form>
          </div>
        )}
        
        {/* Reviews Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Rating Overview */}
          <div className="card p-8 text-center">
            <div className="text-5xl font-bold text-accent-600 mb-2">
              {product.rating?.toFixed(1) || '0'}
            </div>
            <div className="flex justify-center mb-2">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  size={20}
                  className={i < Math.floor(product.rating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                />
              ))}
            </div>
            <p className="text-primary-600">
              Dựa trên {product.numReviews || 0} đánh giá
            </p>
          </div>

          {/* Rating Breakdown */}
          <div className="card p-8 md:col-span-2">
            {[5, 4, 3, 2, 1].map((stars) => (
              <div key={stars} className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-1 w-16">
                  {[...Array(stars)].map((_, i) => (
                    <FiStar key={i} size={14} className="text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <div className="flex-1 h-2 bg-primary-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500" style={{ width: '0%' }}></div>
                </div>
                <span className="text-sm text-primary-600 w-12 text-right">0%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((review, idx) => (
              <div key={idx} className="card p-6 border-l-4 border-accent-500">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-200 flex items-center justify-center">
                      <FiUser className="text-primary-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-primary-900">{review.userName || 'Khách hàng'}</p>
                      <p className="text-xs text-primary-500">
                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        size={16}
                        className={i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-primary-700">{review.comment}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-primary-600">
              Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedData?.data && relatedData.data.length > 0 && (
        <div className="mt-16 border-t border-primary-200 pt-12">
          <h2 className="text-2xl font-semibold text-primary-900 mb-8">
            Sản phẩm liên quan
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedData.data
              .filter(p => p._id !== product._id)
              .slice(0, 6)
              .map((relatedProduct) => (
                <ProductCard key={relatedProduct._id} product={relatedProduct} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
