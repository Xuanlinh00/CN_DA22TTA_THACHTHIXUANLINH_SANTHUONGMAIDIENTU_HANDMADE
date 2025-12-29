import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiCheck, FiX, FiTrash2, FiEye, FiX as FiClose } from 'react-icons/fi';
import { useState } from 'react';
import { adminService } from '../../services/adminService';
import { formatDateTime, getShopStatusLabel } from '../../utils/formatters';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const AdminShops = () => {
  const queryClient = useQueryClient();
  const [selectedShop, setSelectedShop] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-shops'],
    queryFn: () => adminService.getAllShops({ status: 'all' }),
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
                      <button
                        onClick={() => setSelectedShop(shop)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Xem chi tiết"
                      >
                        <FiEye size={18} />
                      </button>
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

      {/* Shop Detail Modal */}
      {selectedShop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-primary-900">
                Chi tiết cửa hàng
              </h2>
              <button
                onClick={() => setSelectedShop(null)}
                className="text-primary-400 hover:text-primary-600"
              >
                <FiClose size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Shop Header */}
              <div className="flex items-start gap-4 pb-6 border-b border-primary-200">
                <img
                  src={selectedShop.avatar}
                  alt={selectedShop.shopName}
                  className="w-24 h-24 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-primary-900 mb-2">
                    {selectedShop.shopName}
                  </h3>
                  <p className="text-primary-600 mb-3">{selectedShop.description}</p>
                  <span className={`badge ${
                    selectedShop.status === 'active'
                      ? 'badge-success'
                      : selectedShop.status === 'pending'
                      ? 'badge-warning'
                      : 'badge-danger'
                  }`}>
                    {getShopStatusLabel(selectedShop.status)}
                  </span>
                </div>
              </div>

              {/* Owner Information */}
              <div>
                <h4 className="font-semibold text-primary-900 mb-3">👤 Thông tin chủ shop</h4>
                <div className="bg-primary-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-primary-600">Tên:</span>
                    <span className="font-medium text-primary-900">{selectedShop.user?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-600">Email:</span>
                    <span className="font-medium text-primary-900">{selectedShop.user?.email}</span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="font-semibold text-primary-900 mb-3">📞 Thông tin liên hệ</h4>
                <div className="bg-primary-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-primary-600">Số điện thoại:</span>
                    <span className="font-medium text-primary-900">{selectedShop.phone}</span>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h4 className="font-semibold text-primary-900 mb-3">📍 Địa chỉ</h4>
                <div className="bg-primary-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-primary-600">Đường:</span>
                    <span className="font-medium text-primary-900">{selectedShop.address?.street}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-600">Phường/Xã:</span>
                    <span className="font-medium text-primary-900">{selectedShop.address?.ward}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-600">Quận/Huyện:</span>
                    <span className="font-medium text-primary-900">{selectedShop.address?.district}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-600">Tỉnh/Thành phố:</span>
                    <span className="font-medium text-primary-900">{selectedShop.address?.city}</span>
                  </div>
                </div>
              </div>

              {/* Commission Policy Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">💰 Chính sách hoa hồng</h4>
                <p className="text-sm text-blue-800">
                  Chủ shop đã đồng ý với chính sách hoa hồng 5% từ doanh thu của mỗi đơn hàng hoàn thành.
                </p>
              </div>

              {/* Dates */}
              <div>
                <h4 className="font-semibold text-primary-900 mb-3">📅 Thông tin khác</h4>
                <div className="bg-primary-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-primary-600">Ngày tạo:</span>
                    <span className="font-medium text-primary-900">{formatDateTime(selectedShop.createdAt)}</span>
                  </div>
                  {selectedShop.approvedAt && (
                    <div className="flex justify-between">
                      <span className="text-primary-600">Ngày duyệt:</span>
                      <span className="font-medium text-primary-900">{formatDateTime(selectedShop.approvedAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {selectedShop.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-primary-200">
                  <button
                    onClick={() => {
                      handleApprove(selectedShop._id, 'active');
                      setSelectedShop(null);
                    }}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    <FiCheck size={18} />
                    Duyệt cửa hàng
                  </button>
                  <button
                    onClick={() => {
                      handleApprove(selectedShop._id, 'rejected');
                      setSelectedShop(null);
                    }}
                    className="flex-1 btn-outline text-red-600 hover:bg-red-50 flex items-center justify-center gap-2"
                  >
                    <FiX size={18} />
                    Từ chối
                  </button>
                </div>
              )}

              <button
                onClick={() => setSelectedShop(null)}
                className="w-full btn-outline"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShops;
