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
            price: item.price,
            orders: new Set()
          };
        }
        productStats[productId].quantity += item.quantity;
        productStats[productId].revenue += item.subtotal;
        productStats[productId].orders.add(order._id);
      });
    }
  });

  const topProducts = Object.values(productStats)
    .map(p => ({
      ...p,
      orders: p.orders.size,
      aov: p.revenue / p.orders.size
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/default-product.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:8000${imagePath}`;
  };

  return (
    <div className="card p-6">
      <h2 className="text-lg font-bold text-primary-900 mb-4">🔥 Top 10 sản phẩm bán chạy</h2>

      {topProducts.length === 0 ? (
        <p className="text-center text-primary-600 py-8">Chưa có dữ liệu</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-primary-50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-primary-900">Xếp hạng</th>
                <th className="px-3 py-2 text-left font-semibold text-primary-900">Sản phẩm</th>
                <th className="px-3 py-2 text-center font-semibold text-primary-900">Số lượng</th>
                <th className="px-3 py-2 text-right font-semibold text-primary-900">Doanh thu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-200">
              {topProducts.map((product, index) => (
                <tr key={index} className="hover:bg-primary-50">
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-white text-xs ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-600' :
                      'bg-primary-400'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        className="w-8 h-8 rounded object-cover"
                      />
                      <span className="truncate text-primary-900 font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className="font-bold text-accent-600">{product.quantity}</span>
                  </td>
                  <td className="px-3 py-2 text-right font-semibold text-green-600">
                    {formatCurrency(product.revenue)}
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
