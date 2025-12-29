import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { FiFilter } from 'react-icons/fi';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import ProductCard from '../components/common/ProductCard';
import Pagination from '../components/common/Pagination';
import Loading from '../components/common/Loading';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: '',
    maxPrice: '',
    keyword: searchParams.get('keyword') || '',
  });

  // Cập nhật filters khi URL thay đổi
  useEffect(() => {
    setFilters({
      category: searchParams.get('category') || '',
      minPrice: '',
      maxPrice: '',
      keyword: searchParams.get('keyword') || '',
    });
    setPage(1);
  }, [searchParams]);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', page, filters],
    queryFn: () => productService.getAll({ page, ...filters }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll,
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-sans font-bold text-primary-900 mb-8">
        Sản phẩm Handmade
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-20">
            <h2 className="text-lg font-semibold text-primary-900 mb-4 flex items-center">
              <FiFilter className="mr-2" />
              Bộ lọc
            </h2>

            {/* Search */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Tìm kiếm
              </label>
              <input
                type="text"
                value={filters.keyword}
                onChange={(e) => handleFilterChange('keyword', e.target.value)}
                placeholder="Tên sản phẩm..."
                className="input-field"
              />
            </div>

            {/* Category */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-primary-700 mb-3">
                Danh mục
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <button
                  onClick={() => handleFilterChange('category', '')}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    filters.category === ''
                      ? 'bg-accent-100 text-accent-700 font-medium'
                      : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                  }`}
                >
                  <span className="text-lg mr-2">📦</span>
                  Tất cả danh mục
                </button>
                {categoriesData?.data?.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => handleFilterChange('category', cat._id)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      filters.category === cat._id
                        ? 'bg-accent-100 text-accent-700 font-medium'
                        : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg flex-shrink-0">{cat.icon || '🎨'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{cat.name}</p>
                        <p className="text-xs text-primary-600 line-clamp-1">{cat.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Khoảng giá
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  placeholder="Từ"
                  className="input-field"
                />
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  placeholder="Đến"
                  className="input-field"
                />
              </div>
            </div>

            {/* Reset */}
            <button
              onClick={() => {
                setFilters({ category: '', minPrice: '', maxPrice: '', keyword: '' });
                setPage(1);
              }}
              className="w-full btn-outline"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <Loading />
          ) : productsData?.data?.length > 0 ? (
            <>
              <div className="mb-4 text-primary-600">
                Tìm thấy {productsData.pagination?.total || 0} sản phẩm
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {productsData.data.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              <Pagination
                currentPage={page}
                totalPages={productsData.pagination?.pages || 1}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-primary-600 text-lg">Không tìm thấy sản phẩm nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
