import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiShoppingBag, FiTrendingUp } from 'react-icons/fi';
import { categoryService } from '../services/categoryService';
import { productService } from '../services/productService';
import Loading from '../components/common/Loading';

const Categories = () => {
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['all-categories'],
    queryFn: categoryService.getAll,
  });

  const { data: productsData } = useQuery({
    queryKey: ['all-products'],
    queryFn: () => productService.getAll({ limit: 1000 }),
  });

  if (categoriesLoading) return <Loading fullScreen />;

  const categories = categoriesData?.data || [];
  const products = productsData?.data || [];

  // Tính số sản phẩm cho mỗi danh mục
  const getCategoryProductCount = (categoryId) => {
    return products.filter(p => p.category?._id === categoryId).length;
  };

  // Tính giá trung bình cho mỗi danh mục
  const getCategoryAveragePrice = (categoryId) => {
    const categoryProducts = products.filter(p => p.category?._id === categoryId);
    if (categoryProducts.length === 0) return 0;
    const total = categoryProducts.reduce((sum, p) => sum + (p.price || 0), 0);
    return Math.round(total / categoryProducts.length);
  };

  // Tính tổng doanh số (số lượng bán) cho mỗi danh mục
  const getCategorySalesCount = (categoryId) => {
    const categoryProducts = products.filter(p => p.category?._id === categoryId);
    return categoryProducts.reduce((sum, p) => sum + (p.sold || 0), 0);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12">
        <h1 className="text-4xl font-sans font-bold text-primary-900 mb-4">
          Danh mục sản phẩm Handmade
        </h1>
        <p className="text-lg text-primary-600 max-w-2xl">
          Khám phá các danh mục sản phẩm handmade độc đáo được tạo ra bởi những người thợ thủ công tài năng
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-primary-600 text-lg">Chưa có danh mục nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const productCount = getCategoryProductCount(category._id);
            const avgPrice = getCategoryAveragePrice(category._id);
            const salesCount = getCategorySalesCount(category._id);
            return (
              <Link
                key={category._id}
                to={`/products?category=${category._id}`}
                className="group card overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Category Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-primary-900 mb-2 group-hover:text-accent-600 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-primary-600 text-sm line-clamp-2">
                        {category.description}
                      </p>
                    </div>
                    <div className="text-3xl ml-2 flex-shrink-0">
                      {category.icon || '🎨'}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 py-4 border-y border-primary-200 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-accent-600">{productCount}</div>
                      <div className="text-xs text-primary-600">Sản phẩm</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-accent-600">{salesCount}</div>
                      <div className="text-xs text-primary-600">Đã bán</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-accent-600">{avgPrice.toLocaleString()}₫</div>
                      <div className="text-xs text-primary-600">Giá TB</div>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-primary-600">Xem chi tiết</span>
                    <div className="flex items-center text-accent-600 group-hover:translate-x-1 transition-transform">
                      <FiArrowRight size={20} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Featured Categories Section */}
      {categories.length > 0 && (
        <div className="mt-16 pt-12 border-t border-primary-200">
          <h2 className="text-3xl font-sans font-bold text-primary-900 mb-8">
            Danh mục nổi bật
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {categories.slice(0, 2).map((category) => {
              const productCount = getCategoryProductCount(category._id);
              const avgPrice = getCategoryAveragePrice(category._id);
              const salesCount = getCategorySalesCount(category._id);
              return (
                <Link
                  key={category._id}
                  to={`/products?category=${category._id}`}
                  className="group card overflow-hidden hover:shadow-2xl transition-all duration-300"
                >
                  <div className="p-8 flex flex-col justify-between">
                      <div>
                        <h3 className="text-3xl font-bold text-primary-900 mb-3 group-hover:text-accent-600 transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-primary-600 text-base mb-4 line-clamp-3">
                          {category.description}
                        </p>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-3 py-4 border-t border-primary-200 mb-4">
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <FiShoppingBag size={16} className="text-accent-600" />
                            <span className="text-lg font-bold text-accent-600">{productCount}</span>
                          </div>
                          <div className="text-xs text-primary-600">Sản phẩm</div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <FiTrendingUp size={16} className="text-accent-600" />
                            <span className="text-lg font-bold text-accent-600">{salesCount}</span>
                          </div>
                          <div className="text-xs text-primary-600">Đã bán</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-accent-600 mb-1">{avgPrice.toLocaleString()}₫</div>
                          <div className="text-xs text-primary-600">Giá TB</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-primary-600">Khám phá ngay</span>
                        <div className="flex items-center text-accent-600 group-hover:translate-x-2 transition-transform">
                          <FiArrowRight size={24} />
                        </div>
                      </div>
                    </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
