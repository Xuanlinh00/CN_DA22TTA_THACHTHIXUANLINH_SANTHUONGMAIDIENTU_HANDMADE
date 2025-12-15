import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FiEye } from 'react-icons/fi';
import { productService } from '../../services/productService';
import { formatCurrency } from '../../utils/formatters';
import Loading from '../../components/common/Loading';

const AdminProducts = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => productService.getAll({ limit: 100 }),
  });

  // Helper function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/default-product-icon.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    // Remove /api from the URL if present, since images are served at /uploads not /api/uploads
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '');
    return `${baseUrl}${imagePath}`;
  };

  if (isLoading) return <Loading />;

  const products = data?.data || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-sans font-bold text-primary-900 mb-8">
        Quản lý sản phẩm
      </h1>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">
                  Sản phẩm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">
                  Cửa hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">
                  Giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">
                  Tồn kho
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">
                  Danh mục
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-primary-700 uppercase">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-primary-200">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-primary-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={getImageUrl(product.images?.[0])}
                        alt={product.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-primary-900">
                          {product.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-primary-900">
                      {product.shop?.shopName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-accent-600">
                      {formatCurrency(product.price)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-primary-900">{product.stock}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-primary-900">
                      {product.category?.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Link
                      to={`/products/${product._id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <FiEye size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
