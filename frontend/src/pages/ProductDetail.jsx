import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiShoppingCart, FiStar, FiMapPin, FiPackage, FiMessageCircle, FiMinus, FiPlus } from 'react-icons/fi';
import { productService } from '../services/productService';
import useCartStore from '../stores/cartStore';
import useAuthStore from '../stores/authStore';
import { formatCurrency } from '../utils/formatters';
import Loading from '../components/common/Loading';
import ProductCard from '../components/common/ProductCard';
import ReviewList from '../components/product/ReviewList';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description'); // description | reviews

  const { data, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getById(id),
  });

  const product = data?.data;

  const { data: relatedData } = useQuery({
    queryKey: ['related-products', product?.category?._id],
    queryFn: () => productService.getAll({ 
      category: product?.category?._id, 
      limit: 8 
    }),
    enabled: !!product?.category?._id,
  });

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/default-product-large.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '');
    return `${baseUrl}${imagePath}`;
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      navigate('/login');
      return;
    }
    
    if (product.shop?._id === localStorage.getItem('shopId')) {
      toast.error('Bạn không thể mua sản phẩm của chính shop mình');
      return;
    }
    
    addToCart(product, quantity);
    toast.success('Đã thêm vào giỏ hàng!');
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để mua hàng');
      navigate('/login');
      return;
    }
    
    if (product.shop?._id === localStorage.getItem('shopId')) {
      toast.error('Bạn không thể mua sản phẩm của chính shop mình');
      return;
    }
    
    const item = { ...product, quantity };
    sessionStorage.setItem('tempCart', JSON.stringify([item]));
    navigate('/checkout');
  };

  if (isLoading) return <Loading fullScreen />;
  if (!product) return <div className="container mx-auto px-4 py-20 text-center text-xl">Không tìm thấy sản phẩm</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <Link to="/" className="text-primary-600 hover:text-primary-900">Trang chủ</Link>
        <span className="mx-2 text-primary-400">/</span>
        <Link to="/products" className="text-primary-600 hover:text-primary-900">Sản phẩm</Link>
        <span className="mx-2 text-primary-400">/</span>
        <span className="text-primary-900 font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Images - Left */}
        <div className="order-1 lg:order-1">
          <div className="card overflow-hidden mb-4 shadow-lg">
            <img
              src={getImageUrl(product.images?.[selectedImage])}
              alt={product.name}
              className="w-full aspect-square object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>

          {product.images?.length > 1 && (
            <div className="grid grid-cols-5 gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`card overflow-hidden transition-all ${
                    selectedImage === idx 
                      ? 'ring-4 ring-primary-600 shadow-md' 
                      : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  <img 
                    src={getImageUrl(img)} 
                    alt="" 
                    className="w-full aspect-square object-cover" 
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info - Right */}
        <div className="order-2 lg:order-2 space-y-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-primary-900 mb-3">
              {product.name}
            </h1>

            {/* Rating */}
            {product.rating > 0 && (
              <div className="flex items-center gap-3 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      size={20}
                      className={i < Math.floor(product.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="font-medium text-primary-800">{product.rating.toFixed(1)}</span>
                <span className="text-primary-600">({product.numReviews || 0} đánh giá)</span>
              </div>
            )}

            {/* Category */}
            {product.category && (
              <Link
                to={`/products?category=${product.category._id}`}
                className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium hover:bg-primary-200 transition"
              >
                {product.category.name}
              </Link>
            )}
          </div>

          {/* Price */}
          <div className="py-4">
            <span className="text-4xl lg:text-5xl font-bold text-accent-600">
              {formatCurrency(product.price)}
            </span>
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2 text-primary-700">
            <FiPackage />
            <span>
              {product.stockQuantity > 0 ? (
                <span className="text-green-600 font-medium">Còn hàng ({product.stockQuantity} sản phẩm)</span>
              ) : (
                <span className="text-red-600 font-medium">Hết hàng</span>
              )}
            </span>
          </div>

          {/* Quantity Selector */}
          {product.stockQuantity > 0 && (
            <div className="flex items-center gap-4 py-4">
              <span className="font-medium text-primary-800">Số lượng:</span>
              <div className="flex items-center border border-primary-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 hover:bg-primary-100 transition"
                >
                  <FiMinus />
                </button>
                <span className="px-6 py-3 font-semibold text-lg min-w-16 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                  className="px-4 py-3 hover:bg-primary-100 transition"
                >
                  <FiPlus />
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6">
            <button
              onClick={handleAddToCart}
              disabled={product.stockQuantity === 0}
              className="btn-primary flex items-center justify-center gap-3 py-4 text-lg font-semibold disabled:opacity-60"
            >
              <FiShoppingCart size={20} />
              Thêm vào giỏ hàng
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stockQuantity === 0}
              className="bg-accent-600 hover:bg-accent-700 text-white font-semibold py-4 rounded-lg transition flex items-center justify-center gap-3 text-lg disabled:opacity-60"
            >
              <FiShoppingCart size={20} />
              Mua ngay
            </button>
          </div>

          {/* Shop Info Card */}
          <div className="card p-6 bg-gradient-to-r from-primary-50 to-primary-100">
            <Link
              to={`/shops/${product.shop?._id}`}
              className="flex items-center gap-4 hover:opacity-90 transition"
            >
              <img
                src={getImageUrl(product.shop?.avatar) || '/default-shop-avatar.jpg'}
                alt={product.shop?.shopName}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-primary-200"
                onError={(e) => e.target.src = '/default-shop-avatar.jpg'}
              />
              <div>
                <p className="font-bold text-primary-900 text-lg">{product.shop?.shopName}</p>
                <p className="text-sm text-primary-600 flex items-center gap-1">
                  <FiMapPin size={14} />
                  {product.shop?.address?.city || 'Việt Nam'}
                </p>
              </div>
            </Link>

            {isAuthenticated && product.shop?._id !== localStorage.getItem('shopId') && (
              <button
                onClick={() => navigate(`/messages?shop=${product.shop?._id}&product=${product._id}`)}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition font-medium"
              >
                <FiMessageCircle size={18} />
                Nhắn tin với shop
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs: Mô tả, Đánh giá */}
      <div className="mt-16">
        <div className="flex border-b border-primary-200">
          <button
            onClick={() => setActiveTab('description')}
            className={`px-6 py-4 font-semibold text-lg transition ${
              activeTab === 'description'
                ? 'text-primary-900 border-b-4 border-primary-600'
                : 'text-primary-600 hover:text-primary-900'
            }`}
          >
            Mô tả sản phẩm
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-4 font-semibold text-lg transition relative ${
              activeTab === 'reviews'
                ? 'text-primary-900 border-b-4 border-primary-600'
                : 'text-primary-600 hover:text-primary-900'
            }`}
          >
            Đánh giá ({product.numReviews || 0})
          </button>
        </div>

        <div className="mt-8">
          {activeTab === 'description' && (
            <div className="space-y-8">
              <div className="card p-8 bg-primary-50">
                <h3 className="text-xl font-bold text-primary-900 mb-4">Chi tiết sản phẩm</h3>
                <div className="text-primary-700 whitespace-pre-line leading-relaxed prose max-w-none">
                  {product.description || 'Không có mô tả chi tiết.'}
                </div>
              </div>

              {product.material && (
                <div className="card p-6">
                  <h4 className="font-semibold text-primary-900 mb-2">Chất liệu</h4>
                  <p className="text-primary-700">{product.material}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8">
              {/* Rating Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="card p-8 text-center bg-gradient-to-b from-yellow-50 to-white">
                  <div className="text-6xl font-bold text-accent-600 mb-3">
                    {product.rating?.toFixed(1) || '0.0'}
                  </div>
                  <div className="flex justify-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        size={28}
                        className={i < Math.floor(product.rating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <p className="text-primary-600 font-medium">
                    {product.numReviews || 0} đánh giá
                  </p>
                </div>

                <div className="card p-8 md:col-span-2">
                  <h4 className="font-semibold text-primary-900 mb-6">Phân bố đánh giá</h4>
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = product.ratingCount?.[stars] || 0;
                    const percent = product.numReviews > 0 ? (count / product.numReviews) * 100 : 0;
                    return (
                      <div key={stars} className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-1 w-20">
                          <span className="text-sm font-medium">{stars}</span>
                          <FiStar size={16} className="text-yellow-500 fill-yellow-500" />
                        </div>
                        <div className="flex-1 bg-primary-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-700"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-sm text-primary-600 w-16 text-right">{percent.toFixed(0)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Review List */}
              <div>
                {product.reviews?.length > 0 ? (
                  <ReviewList reviews={product.reviews} />
                ) : (
                  <div className="text-center py-12 bg-primary-50 rounded-xl">
                    <p className="text-primary-600 text-lg">Chưa có đánh giá nào cho sản phẩm này.</p>
                    <p className="text-primary-500 mt-2">Hãy là người đầu tiên đánh giá nhé!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedData?.data && relatedData.data.length > 0 && (
        <section className="mt-20">
          <h2 className="text-3xl font-bold text-primary-900 mb-8">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {relatedData.data
              .filter(p => p._id !== product._id)
              .slice(0, 10)
              .map((relatedProduct) => (
                <ProductCard key={relatedProduct._id} product={relatedProduct} />
              ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;