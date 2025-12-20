import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FiMapPin, FiStar } from 'react-icons/fi';
import { shopService } from '../services/shopService';
import Pagination from '../components/common/Pagination';
import Loading from '../components/common/Loading';

const Shops = () => {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['shops', page, keyword],
    queryFn: () => shopService.getAll({ page, keyword }),
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  // Helper function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/150';
    if (imagePath.startsWith('http')) return imagePath;
    // Remove /api from the URL if present, since images are served at /uploads not /api/uploads
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '');
    return `${baseUrl}${imagePath}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-sans font-bold text-primary-900 mb-8">
        Cửa hàng Handmade
      </h1>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="max-w-md">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm kiếm cửa hàng..."
            className="input-field"
          />
        </div>
      </form>

      {isLoading ? (
        <Loading />
      ) : data?.data?.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.data.map((shop) => (
              <Link
                key={shop._id}
                to={`/shops/${shop._id}`}
                className="card overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Cover Image */}
                <div className="h-32 bg-gradient-to-r from-primary-600 to-primary-800 relative">
                  <img
                    src={getImageUrl(shop.coverImage)}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/800x200';
                    }}
                  />
                </div>

                {/* Shop Info */}
                <div className="p-6 relative">
                  {/* Avatar */}
                  <div className="absolute -top-12 left-6">
                    <img
                      src={getImageUrl(shop.avatar)}
                      alt={shop.shopName}
                      className="w-24 h-24 rounded-full border-4 border-white object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/150';
                      }}
                    />
                  </div>

                  <div className="mt-14">
                    <h3 className="text-xl font-semibold text-primary-900 mb-2">
                      {shop.shopName}
                    </h3>

                    <p className="text-sm text-primary-600 line-clamp-2 mb-3">
                      {shop.description}
                    </p>

                    <div className="flex items-center text-sm text-primary-600 mb-2">
                      <FiMapPin className="mr-1" size={14} />
                      <span>{shop.address?.city}</span>
                    </div>

                    {shop.rating > 0 && (
                      <div className="flex items-center space-x-1">
                        <FiStar className="text-yellow-500 fill-yellow-500" size={16} />
                        <span className="text-sm font-medium">{shop.rating.toFixed(1)}</span>
                        <span className="text-sm text-primary-500">
                          ({shop.totalReviews || 0})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={data.pagination?.pages || 1}
            onPageChange={setPage}
          />
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-primary-600 text-lg">Không tìm thấy cửa hàng nào</p>
        </div>
      )}
    </div>
  );
};

export default Shops;
