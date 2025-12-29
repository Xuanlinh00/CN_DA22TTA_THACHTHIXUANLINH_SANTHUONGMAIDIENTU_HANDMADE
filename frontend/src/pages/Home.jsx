import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiArrowRight, FiShoppingBag, FiUsers, FiTrendingUp } from 'react-icons/fi';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import ProductCard from '../components/common/ProductCard';
import Loading from '../components/common/Loading';
import HeroBanner from '../components/common/HeroBanner';
import useAuthStore from '../stores/authStore';

const Home = () => {
  const { user } = useAuthStore();
  // Lấy sản phẩm được tìm kiếm và mua nhiều nhất (18 sản phẩm)
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const response = await fetch('/api/products/featured?limit=18');
      return response.json();
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll,
  });

  // Hero banner slides
  const heroSlides = [
    {
      title: 'Khám phá thế giới Handmade độc đáo',
      description: 'Chất lượng được đảm bảo - Nơi kết nối những người thợ thủ công tài năng với khách hàng yêu thích sản phẩm độc đáo',
      image: '/slider1.jpg',
      buttons: [
        { label: 'Khám phá ngay', link: '/products', variant: 'primary' },
        { label: 'Bắt đầu bán hàng', link: '/register', variant: 'secondary' }
      ]
    },
    {
      title: 'Sáng tạo không giới hạn',
      description: 'Mỗi sản phẩm handmade là một tác phẩm nghệ thuật độc nhất vô nhị được tạo ra với tình yêu và tâm huyết',
      image: '/slider2.jpg',
      buttons: [
        { label: 'Xem sản phẩm', link: '/products', variant: 'primary' },
        { label: 'Liên hệ chúng tôi', link: '/contact', variant: 'secondary' }
      ]
    },
    {
      title: 'Chất lượng được đảm bảo',
      description: 'Tất cả sản phẩm trên Craftify đều được kiểm duyệt kỹ lưỡng để đảm bảo chất lượng tốt nhất',
      image: '/slider3.jpg',
      buttons: [
        { label: 'Mua ngay', link: '/products', variant: 'primary' },
        { label: 'Tìm hiểu thêm', link: '/about', variant: 'secondary' }
      ]
    }
  ];

  return (
    <div>
      {/* Hero Section with Banner */}
      <div className="mb-0">
        <HeroBanner slides={heroSlides} />
      </div>

      {/* Main Content Section - Sidebar Layout */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Sidebar - Stats and Categories */}
            <div className="lg:col-span-3 space-y-6">
              {/* Stats Section - Vertical Stack */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-primary-50 p-4 rounded-lg shadow-md">
                  <div className="flex items-center justify-center w-12 h-12 bg-accent-100 rounded-full flex-shrink-0">
                    <FiShoppingBag className="text-accent-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-primary-900">1000+</h3>
                    <p className="text-sm text-primary-600">Sản phẩm handmade</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-primary-50 p-4 rounded-lg shadow-md">
                  <div className="flex items-center justify-center w-12 h-12 bg-accent-100 rounded-full flex-shrink-0">
                    <FiUsers className="text-accent-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-primary-900">500+</h3>
                    <p className="text-sm text-primary-600">Người thợ thủ công</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-primary-50 p-4 rounded-lg shadow-md">
                  <div className="flex items-center justify-center w-12 h-12 bg-accent-100 rounded-full flex-shrink-0">
                    <FiTrendingUp className="text-accent-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-primary-900">5000+</h3>
                    <p className="text-sm text-primary-600">Đơn hàng thành công</p>
                  </div>
                </div>
              </div>

              {/* Categories Section - Vertical Stack */}
              {categoriesData?.data && categoriesData.data.length > 0 && (
                <div>
                  <h2 className="text-xl font-sans font-bold text-primary-900 mb-4">
                    Danh mục sản phẩm
                  </h2>
                  <div className="space-y-3">
                    {categoriesData.data.slice(0, 6).map((category) => (
                      <Link
                        key={category._id}
                        to={`/products?category=${category._id}`}
                        className="card p-4 hover:shadow-lg transition-all hover:bg-primary-50"
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-3xl flex-shrink-0">{category.icon || '🎨'}</div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-primary-900 text-sm">{category.name}</h3>
                            <p className="text-xs text-primary-600 mt-1 line-clamp-2">{category.description}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link 
                    to="/products" 
                    className="mt-4 w-full btn-outline text-center text-sm"
                  >
                    Xem tất cả danh mục
                  </Link>
                </div>
              )}
            </div>

            {/* Right Content - Featured Products */}
            <div className="lg:col-span-9">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-sans font-bold text-primary-900">
                  Sản phẩm được tìm kiếm và mua nhiều
                </h2>
                <Link to="/products" className="text-primary-700 hover:text-primary-900 font-medium flex items-center">
                  Xem tất cả
                  <FiArrowRight className="ml-2" />
                </Link>
              </div>

              {productsLoading ? (
                <Loading />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {productsData?.data?.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Chỉ hiện cho user thường */}
      {(!user || user?.role === 'user') && (
        <section className="py-16 bg-gradient-to-r from-accent-500 to-accent-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-sans font-bold mb-4">
              Bạn là người thợ thủ công?
            </h2>
            <p className="text-xl text-accent-100 mb-8 max-w-2xl mx-auto">
              Tham gia Craftify để tiếp cận hàng ngàn khách hàng tiềm năng và phát triển doanh nghiệp của bạn
            </p>
            <Link to="/register" className="btn-primary bg-white text-accent-600 hover:bg-primary-50">
              Đăng ký mở shop ngay
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
