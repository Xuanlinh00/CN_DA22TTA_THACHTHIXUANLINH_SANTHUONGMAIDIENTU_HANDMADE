import { FiMapPin, FiPhone, FiStar } from 'react-icons/fi';

const ShopSidebar = ({ shop, products, categories }) => {
  // Tính số sản phẩm theo danh mục
  const shopCategories = new Map();
  products?.forEach(product => {
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
    <div className="space-y-6 sticky top-24">
      {/* Shop Info Card */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-primary-900 mb-4">
          ℹ️ Thông tin cửa hàng
        </h3>
        
        <div className="space-y-4">
          {/* Address */}
          <div>
            <p className="text-xs font-semibold text-primary-600 uppercase mb-1">
              Địa chỉ
            </p>
            <p className="text-sm text-primary-900 flex items-start gap-2">
              <FiMapPin className="flex-shrink-0 mt-0.5" size={16} />
              <span>
                {shop.address?.street}, {shop.address?.ward}, {shop.address?.district}, {shop.address?.city}
              </span>
            </p>
          </div>

          {/* Phone */}
          <div>
            <p className="text-xs font-semibold text-primary-600 uppercase mb-1">
              Điện thoại
            </p>
            <p className="text-sm text-primary-900 flex items-center gap-2">
              <FiPhone className="flex-shrink-0" size={16} />
              <a href={`tel:${shop.phone}`} className="hover:text-accent-600 transition-colors">
                {shop.phone}
              </a>
            </p>
          </div>

          {/* Status */}
          <div>
            <p className="text-xs font-semibold text-primary-600 uppercase mb-1">
              Trạng thái
            </p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              shop.status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {shop.status === 'active' ? '✓ Đang hoạt động' : '⏳ Chờ duyệt'}
            </span>
          </div>

          {/* Rating */}
          {shop.rating > 0 && (
            <div>
              <p className="text-xs font-semibold text-primary-600 uppercase mb-1">
                Đánh giá
              </p>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      size={16}
                      className={i < Math.round(shop.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-primary-300'}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-primary-900">
                  {shop.rating.toFixed(1)}
                </span>
              </div>
            </div>
          )}

          {/* Products Count */}
          <div className="pt-2 border-t border-primary-200">
            <p className="text-sm font-semibold text-primary-900">
              📦 {products?.length || 0} sản phẩm
            </p>
          </div>
        </div>
      </div>

      {/* Shop Categories */}
      {shopCategories.size > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-bold text-primary-900 mb-4">
            🏷️ Danh mục sản phẩm
          </h3>
          
          <div className="space-y-2">
            {Array.from(shopCategories.values()).map((category) => (
              <div
                key={category._id}
                className="flex items-center justify-between p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-lg flex-shrink-0">{category.icon || '🎨'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary-900 truncate">
                      {category.name}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-accent-600 bg-accent-100 px-2 py-1 rounded flex-shrink-0">
                  {category.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shop Stats */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-primary-900 mb-4">
          📊 Thống kê
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
            <span className="text-sm text-primary-700">Sản phẩm</span>
            <span className="text-lg font-bold text-blue-600">
              {products?.length || 0}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
            <span className="text-sm text-primary-700">Danh mục</span>
            <span className="text-lg font-bold text-green-600">
              {shopCategories.size}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
            <span className="text-sm text-primary-700">Đánh giá</span>
            <span className="text-lg font-bold text-purple-600">
              {shop.totalReviews || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopSidebar;
