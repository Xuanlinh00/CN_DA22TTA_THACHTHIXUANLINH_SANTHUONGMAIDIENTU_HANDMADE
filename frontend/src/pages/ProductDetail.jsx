import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiShoppingCart, FiStar, FiMapPin, FiPackage } from 'react-icons/fi';
import { productService } from '../services/productService';
import useCartStore from '../stores/cartStore';
import useAuthStore from '../stores/authStore';
import { formatCurrency } from '../utils/formatters';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getById(id),
  });

  const product = data?.data;

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
          <h1 className="text-3xl font-display font-bold text-primary-900 mb-4">
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
            <button className="btn-secondary">Mua ngay</button>
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
    </div>
  );
};

export default ProductDetail;
