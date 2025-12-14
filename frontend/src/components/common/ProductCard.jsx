import { Link } from 'react-router-dom';
import { FiShoppingCart, FiStar } from 'react-icons/fi';
import { formatCurrency } from '../../utils/formatters';
import useCartStore from '../../stores/cartStore';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { addToCart } = useCartStore();

  // Helper function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/default-product.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    // Remove /api from the URL if present, since images are served at /uploads not /api/uploads
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '');
    return `${baseUrl}${imagePath}`;
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
    toast.success('Đã thêm vào giỏ hàng');
  };

  return (
    <Link to={`/products/${product._id}`} className="card overflow-hidden group">
      {/* Image */}
      <div className="relative overflow-hidden aspect-square">
        <img
src={getImageUrl(product.images?.[0])}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
              Hết hàng
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-primary-900 mb-2 line-clamp-2 group-hover:text-primary-700 transition-colors">
          {product.name}
        </h3>

        {/* Shop Name */}
        <p className="text-sm text-primary-600 mb-2">
          {product.shop?.shopName || 'Shop'}
        </p>

        {/* Rating */}
        {product.rating > 0 && (
          <div className="flex items-center space-x-1 mb-2">
            <FiStar className="text-yellow-500 fill-yellow-500" size={16} />
            <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
            <span className="text-sm text-primary-500">
              ({product.numReviews || 0})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-accent-600">
            {formatCurrency(product.price)}
          </span>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="p-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiShoppingCart size={20} />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
