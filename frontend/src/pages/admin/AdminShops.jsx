import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiCheck, FiX, FiTrash2, FiEye } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { formatDateTime, getShopStatusLabel } from '../../utils/formatters';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const AdminShops = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-shops'],
    queryFn: () => adminService.getAllShops(),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, status }) => adminService.approveShop(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-shops']);
      queryClient.invalidateQueries(['admin-pending-shops']);
      toast.success('Cập nhật trạng thái thành công');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Cập nhật thất bại');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminService.deleteShop,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-shops']);
      toast.success('Xóa cửa hàng thành công');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Xóa thất bại');
    },
  });

  const handleApprove = (id, status) => {
    const message = status === 'active' ? 'duyệt' : 'từ chối';
    if (window.confirm(`Bạn có chắc muốn ${message} cửa hàng này?`)) {
      approveMutation.mutate({ id, status });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa cửa hàng này?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <Loading />;

  const shops = data?.data || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-sans font-bold text-primary-900 mb-8">
        Quản lý cửa hàng
      </h1>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">
                  Cửa hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">
                  Chủ shop
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">
                  Địa chỉ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-primary-700 uppercase">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-primary-200">
              {shops.map((shop) => (
                <tr key={shop._id} className="hover:bg-primary-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={shop.avatar}
                        alt={shop.shopName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-primary-900">
                          {shop.shopName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-primary-900">{shop.user?.name}</div>
                    <div className="text-sm text-primary-500">{shop.user?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-primary-900">
                      {shop.address?.city}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`badge ${
                        shop.status === 'active'
                          ? 'badge-success'
                          : shop.status === 'pending'
                          ? 'badge-warning'
                          : 'badge-danger'
                      }`}
                    >
                      {getShopStatusLabel(shop.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-primary-900">
                      {formatDateTime(shop.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        to={`/shops/${shop._id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FiEye size={18} />
                      </Link>
                      {shop.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(shop._id, 'active')}
                            className="text-green-600 hover:text-green-900"
                            title="Duyệt"
                          >
                            <FiCheck size={18} />
                          </button>
                          <button
                            onClick={() => handleApprove(shop._id, 'rejected')}
                            className="text-red-600 hover:text-red-900"
                            title="Từ chối"
                          >
                            <FiX size={18} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(shop._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Xóa"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
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

export default AdminShops;
