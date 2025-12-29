import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiMapPin, FiPhone, FiStar } from 'react-icons/fi';
import { shopService } from '../services/shopService';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import ProductCard from '../components/common/ProductCard';
import ShopSidebar from '../components/shop/ShopSidebar';
import Loading from '../components/common/Loading';

const ShopDetail = () => {
  const { id } = useParams();

  const { data: shopData, isLoading: shopLoading } = useQuery({
    queryKey: ['shop', id],
    queryFn: () => shopService.getById(id),
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['shop-products', id],
    queryFn: () => productService.getByShop(id),
    enabled: !!id,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll,
  });

  // Helper function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/default-shop-avatar.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    // Remove /api from the URL if present, since images are served at /uploads not /api/uploads
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '');
    return `${baseUrl}${imagePath}`;
  };

  if (shopLoading) return <Loading fullScreen />;

  const shop = shopData?.data;
  if (!shop) return <div className="container mx-auto px-4 py-20 text-center">Không tìm thấy cửa hàng</div>;

  // Lấy danh mục sản phẩm của shop này
  const shopCategories = new Map();
  productsData?.data?.forEach(product => {
    if (product.category) {
      const catId = product.category._id;
      if (!shopCategories.has(catId)) {
        shopCategories.set(catId, {
          ...product.category,
          count: 0
        });
      }
      shopCategories.get(catId).count += 1;
    }
  });

  return (
    <div>
      {/* Shop Header */}
      <div className="bg-gradient-to-r from-primary-800 to-primary-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <img
              src={getImageUrl(shop.avatar)}
              alt={shop.shopName}
              className="w-32 h-32 rounded-full border-4 border-white object-cover"
              onError={(e) => {
                e.target.src = '/default-shop-avatar.jpg';
              }}
            />

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-sans font-bold mb-3">
                {shop.shopName}
              </h1>

              <p className="text-primary-100 mb-4 max-w-2xl">
                {shop.description}
              </p>

              <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm">
                <div className="flex items-center">
                  <FiMapPin className="mr-2" />
                  <span>
                    {shop.address?.district}, {shop.address?.city}
                  </span>
                </div>

                <div className="flex items-center">
                  <FiPhone className="mr-2" />
                  <span>{shop.phone}</span>
                </div>

                {shop.rating > 0 && (
                  <div className="flex items-center">
                    <FiStar className="mr-2 fill-yellow-400 text-yellow-400" />
                    <span>{shop.rating.toFixed(1)} ({shop.totalReviews || 0} đánh giá)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shop Products with Sidebar */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ShopSidebar shop={shop} products={productsData?.data} categories={categoriesData?.data} />
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-sans font-bold text-primary-900 mb-8">
              Sản phẩm của cửa hàng
            </h2>

            {productsLoading ? (
              <Loading />
            ) : productsData?.data?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {productsData.data.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-primary-600">Cửa hàng chưa có sản phẩm nào</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopDetail;
