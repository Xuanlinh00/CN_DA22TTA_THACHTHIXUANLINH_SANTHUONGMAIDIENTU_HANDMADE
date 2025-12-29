import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { formatCurrency } from '../../utils/formatters';
import { FiTrendingUp } from 'react-icons/fi';

const TopSellingProducts = () => {
  const { data: ordersData } = useQuery({
    queryKey: ['admin-all-orders'],
    queryFn: adminService.getAllOrders,
  });

  const orders = ordersData?.data || [];

  // Calculate top-selling products
  const productStats = {};
  
  orders.forEach(order => {
    if (order.status === 'delivered') {
      order.items?.forEach(item => {
        const productId = item.product?._id || item.product;
        if (!productStats[productId]) {
          productStats[productId] = {
            name: item.name,
            image: item.image,
            quantity: 0,
            revenue: 0,
            price: item.price
          };
        }
        productStats[productId].quantity += item.quantity;
        productStats[productId].revenue += item.subtotal;
      });
    }
  });

  const topProducts = Object.values(productStats)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/default-product.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:8000${imagePath}`;
  };

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-primary-900 mb-6 flex items-center gap-2">
        <FiTrendingUp className="text-accent-600" />
        🔥 Sản phẩm bán chạy nhất
      </h2>

      {topProducts.length === 0 ? (
        <div className="text-center py-12 text-primary-600">
          <p>Chưa có dữ liệu sản phẩm bán chạy</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-primary-700 uppercase">Sản phẩm</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-primary-700 uppercase">Số lượng bán</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-primary-700 uppercase">Doanh thu</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-primary-700 uppercase">Giá/cái</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-primary-200">
              {topProducts.map((product, index) => (
                <tr key={index} className="hover:bg-primary-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded overflow-hidden">
                        <img
                          src={getImageUrl(product.image)}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary-900 truncate">
                          {product.name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="text-sm font-semibold text-accent-600">
                      {product.quantity}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="text-sm font-semibold text-green-600">
                      {formatCurrency(product.revenue)}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="text-sm text-primary-600">
                      {formatCurrency(product.price)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TopSellingProducts;
