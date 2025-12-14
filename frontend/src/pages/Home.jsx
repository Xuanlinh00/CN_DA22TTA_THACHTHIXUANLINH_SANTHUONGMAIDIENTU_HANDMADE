import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiArrowRight, FiShoppingBag, FiUsers, FiTrendingUp } from 'react-icons/fi';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import ProductCard from '../components/common/ProductCard';
import Loading from '../components/common/Loading';
import HeroBanner from '../components/common/HeroBanner';

const Home = () => {
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productService.getAll({ page: 1, limit: 8 }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll,
  });

  // Hero banner slides
  const heroSlides = [
    {
      title: 'Khám phá thế giới Handmade độc đáo',
      description: 'Nơi kết nối những người thợ thủ công tài năng với khách hàng yêu thích sản phẩm độc đáo, chất lượng',
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
      <HeroBanner slides={heroSlides} />

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-100 rounded-full mb-4">
                <FiShoppingBag className="text-accent-600" size={32} />
              </div>
              <h3 className="text-3xl font-bold text-primary-900 mb-2">1000+</h3>
              <p className="text-primary-600">Sản phẩm handmade</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-100 rounded-full mb-4">
                <FiUsers className="text-accent-600" size={32} />
              </div>
              <h3 className="text-3xl font-bold text-primary-900 mb-2">500+</h3>
              <p className="text-primary-600">Người thợ thủ công</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-100 rounded-full mb-4">
                <FiTrendingUp className="text-accent-600" size={32} />
              </div>
              <h3 className="text-3xl font-bold text-primary-900 mb-2">5000+</h3>
              <p className="text-primary-600">Đơn hàng thành công</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categoriesData?.data && categoriesData.data.length > 0 && (
        <section className="py-16 bg-primary-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-display font-bold text-primary-900 mb-8 text-center">
              Danh mục sản phẩm
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categoriesData.data.slice(0, 6).map((category) => (
                <Link
                  key={category._id}
                  to={`/products?category=${category._id}`}
                  className="card p-6 text-center hover:shadow-xl transition-shadow"
                >
                  <div className="text-4xl mb-3">{category.icon || '🎨'}</div>
                  <h3 className="font-semibold text-primary-900">{category.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-display font-bold text-primary-900">
              Sản phẩm nổi bật
            </h2>
            <Link to="/products" className="text-primary-700 hover:text-primary-900 font-medium flex items-center">
              Xem tất cả
              <FiArrowRight className="ml-2" />
            </Link>
          </div>

          {productsLoading ? (
            <Loading />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {productsData?.data?.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-accent-500 to-accent-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-display font-bold mb-4">
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
    </div>
  );
};

export default Home;
