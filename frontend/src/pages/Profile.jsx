import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { FiUser, FiMail, FiLock, FiSave, FiMapPin, FiTrash2, FiEdit2, FiPlus } from 'react-icons/fi';
import { MdStorefront } from 'react-icons/md';
import { authService } from '../services/authService';
import { shopService } from '../services/shopService';
import useAuthStore from '../stores/authStore';
import FloatingChat from '../components/common/FloatingChat';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  // Lấy thông tin shop nếu user là shop_owner
  const { data: shopData } = useQuery({
    queryKey: ['my-shop'],
    queryFn: shopService.getMyShop,
    enabled: user?.role === 'shop_owner',
  });

  const shop = shopData?.data;

  const {
    register: registerInfo,
    handleSubmit: handleSubmitInfo,
    formState: { errors: errorsInfo },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    watch,
    reset,
    formState: { errors: errorsPassword },
  } = useForm();

  const {
    register: registerAddress,
    handleSubmit: handleSubmitAddress,
    reset: resetAddress,
    formState: { errors: errorsAddress },
  } = useForm({
    defaultValues: {
      fullName: '',
      phone: '',
      street: '',
      ward: '',
      district: '',
      city: '',
    },
  });

  const password = watch('password');

  const onSubmitInfo = async (data) => {
    setIsLoading(true);
    try {
      const response = await authService.updateProfile(data);
      updateUser(response);
      toast.success('Cập nhật thông tin thành công');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitPassword = async (data) => {
    setIsLoading(true);
    try {
      await authService.updateProfile({ password: data.password });
      toast.success('Đổi mật khẩu thành công');
      reset();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitAddress = async (data) => {
    setIsLoading(true);
    try {
      let response;
      if (editingAddressId) {
        response = await authService.updateAddress(editingAddressId, data);
        toast.success('Cập nhật địa chỉ thành công');
      } else {
        response = await authService.addAddress(data);
        toast.success('Thêm địa chỉ thành công');
      }
      // Update user data từ response
      updateUser(response);
      resetAddress();
      setShowAddressForm(false);
      setEditingAddressId(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddressId(address._id);
    resetAddress(address);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Bạn chắc chắn muốn xoá địa chỉ này?')) return;
    
    setIsLoading(true);
    try {
      const response = await authService.deleteAddress(addressId);
      toast.success('Xoá địa chỉ thành công');
      // Update user data từ response
      updateUser(response);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Xoá thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddressId(null);
    resetAddress();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-sans font-bold text-primary-900 mb-8">
        Tài khoản của tôi
      </h1>

      {/* Call to action for opening shop */}
      {user?.role === 'user' && (
        <div className="bg-gradient-to-r from-accent-500 to-accent-600 rounded-xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">🎨 Bạn muốn bán sản phẩm handmade?</h2>
              <p className="text-accent-100">
                Đăng ký mở shop ngay để tiếp cận hàng ngàn khách hàng tiềm năng!
              </p>
            </div>
            <a
              href="/create-shop"
              className="btn-primary bg-white text-accent-600 hover:bg-primary-50 whitespace-nowrap"
            >
              Mở shop ngay
            </a>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-primary-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                <FiUser size={40} className="text-primary-700" />
              </div>
              <h2 className="font-semibold text-primary-900">{user?.name}</h2>
              <p className="text-sm text-primary-600">{user?.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-accent-100 text-accent-700 rounded-full text-xs font-medium">
                {user?.role === 'admin' ? 'Quản trị viên' : user?.role === 'shop_owner' ? 'Chủ shop' : 'Khách hàng'}
              </span>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('info')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'info'
                    ? 'bg-primary-700 text-white'
                    : 'text-primary-700 hover:bg-primary-100'
                }`}
              >
                Thông tin cá nhân
              </button>
              {user?.role === 'shop_owner' && (
                <button
                  onClick={() => setActiveTab('shop')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'shop'
                      ? 'bg-primary-700 text-white'
                      : 'text-primary-700 hover:bg-primary-100'
                  }`}
                >
                  Thông tin shop
                </button>
              )}
              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'addresses'
                    ? 'bg-primary-700 text-white'
                    : 'text-primary-700 hover:bg-primary-100'
                }`}
              >
                Địa chỉ giao hàng
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'password'
                    ? 'bg-primary-700 text-white'
                    : 'text-primary-700 hover:bg-primary-100'
                }`}
              >
                Đổi mật khẩu
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'info' && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-primary-900 mb-6">
                Thông tin cá nhân
              </h2>

              <form onSubmit={handleSubmitInfo(onSubmitInfo)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Họ và tên
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
                    <input
                      {...registerInfo('name', { required: 'Họ tên là bắt buộc' })}
                      className="input-field pl-10"
                    />
                  </div>
                  {errorsInfo.name && (
                    <p className="mt-1 text-sm text-red-600">{errorsInfo.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
                    <input
                      {...registerInfo('email', {
                        required: 'Email là bắt buộc',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Email không hợp lệ',
                        },
                      })}
                      className="input-field pl-10"
                    />
                  </div>
                  {errorsInfo.email && (
                    <p className="mt-1 text-sm text-red-600">{errorsInfo.email.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary flex items-center space-x-2"
                >
                  <FiSave />
                  <span>{isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                </button>
              </form>
            </div>
          )}

          {activeTab === 'shop' && user?.role === 'shop_owner' && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-primary-900 mb-6 flex items-center">
                <MdStorefront className="mr-2" />
                Thông tin shop
              </h2>

              {shop ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                      <p className="text-sm text-primary-600 mb-1">Tên shop</p>
                      <p className="text-lg font-semibold text-primary-900">{shop.shopName}</p>
                    </div>
                    <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                      <p className="text-sm text-primary-600 mb-1">Trạng thái</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        shop.status === 'active' ? 'bg-green-100 text-green-800' :
                        shop.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {shop.status === 'active' ? '✅ Hoạt động' : 
                         shop.status === 'pending' ? '⏳ Chờ duyệt' : 
                         '❌ Bị từ chối'}
                      </span>
                    </div>
                    <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                      <p className="text-sm text-primary-600 mb-1">Số điện thoại</p>
                      <p className="text-lg font-semibold text-primary-900">{shop.phone || 'Chưa cập nhật'}</p>
                    </div>
                    <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                      <p className="text-sm text-primary-600 mb-1">Ngày tạo</p>
                      <p className="text-lg font-semibold text-primary-900">
                        {new Date(shop.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                    <p className="text-sm text-primary-600 mb-2">Mô tả shop</p>
                    <p className="text-primary-900">{shop.description || 'Chưa có mô tả'}</p>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <strong>ℹ️ Lưu ý:</strong> Để cập nhật thông tin shop, vui lòng truy cập phần cài đặt shop trong bảng điều khiển.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-primary-600 mb-4">Đang tải thông tin shop...</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-primary-900 flex items-center">
                  <FiMapPin className="mr-2" />
                  Địa chỉ giao hàng
                </h2>
                {!showAddressForm && (
                  <button
                    onClick={() => {
                      setShowAddressForm(true);
                      setEditingAddressId(null);
                      resetAddress();
                    }}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <FiPlus />
                    <span>Thêm địa chỉ</span>
                  </button>
                )}
              </div>

              {showAddressForm && (
                <form onSubmit={handleSubmitAddress(onSubmitAddress)} className="mb-8 p-6 bg-primary-50 rounded-lg border border-primary-200">
                  <h3 className="text-lg font-semibold text-primary-900 mb-4">
                    {editingAddressId ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-primary-700 mb-2">
                        Họ và tên *
                      </label>
                      <input
                        {...registerAddress('fullName', { required: 'Họ tên là bắt buộc' })}
                        className="input-field"
                      />
                      {errorsAddress.fullName && (
                        <p className="mt-1 text-sm text-red-600">{errorsAddress.fullName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary-700 mb-2">
                        Số điện thoại *
                      </label>
                      <input
                        {...registerAddress('phone', {
                          required: 'Số điện thoại là bắt buộc',
                          pattern: {
                            value: /^[0-9]{10}$/,
                            message: 'Số điện thoại không hợp lệ',
                          },
                        })}
                        className="input-field"
                      />
                      {errorsAddress.phone && (
                        <p className="mt-1 text-sm text-red-600">{errorsAddress.phone.message}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-primary-700 mb-2">
                        Địa chỉ cụ thể *
                      </label>
                      <input
                        {...registerAddress('street', { required: 'Địa chỉ là bắt buộc' })}
                        className="input-field"
                        placeholder="Số nhà, tên đường"
                      />
                      {errorsAddress.street && (
                        <p className="mt-1 text-sm text-red-600">{errorsAddress.street.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary-700 mb-2">
                        Phường/Xã *
                      </label>
                      <input
                        {...registerAddress('ward', { required: 'Phường/Xã là bắt buộc' })}
                        className="input-field"
                      />
                      {errorsAddress.ward && (
                        <p className="mt-1 text-sm text-red-600">{errorsAddress.ward.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary-700 mb-2">
                        Quận/Huyện *
                      </label>
                      <input
                        {...registerAddress('district', { required: 'Quận/Huyện là bắt buộc' })}
                        className="input-field"
                      />
                      {errorsAddress.district && (
                        <p className="mt-1 text-sm text-red-600">{errorsAddress.district.message}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-primary-700 mb-2">
                        Tỉnh/Thành phố *
                      </label>
                      <input
                        {...registerAddress('city', { required: 'Tỉnh/Thành phố là bắt buộc' })}
                        className="input-field"
                      />
                      {errorsAddress.city && (
                        <p className="mt-1 text-sm text-red-600">{errorsAddress.city.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <FiSave />
                      <span>{isLoading ? 'Đang lưu...' : 'Lưu địa chỉ'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelAddressForm}
                      className="px-4 py-2 border border-primary-300 text-primary-700 rounded-lg hover:bg-primary-50"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              )}

              {user?.addresses && user.addresses.length > 0 ? (
                <div className="space-y-4">
                  {user.addresses.map((address) => (
                    <div key={address._id} className="p-4 border border-primary-200 rounded-lg hover:border-primary-300 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-primary-900">{address.fullName}</h3>
                          <p className="text-sm text-primary-600">{address.phone}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditAddress(address)}
                            className="p-2 text-primary-600 hover:bg-primary-100 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <FiEdit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(address._id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Xoá"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-primary-700">
                        {address.street}, {address.ward}, {address.district}, {address.city}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-primary-600 mb-4">Bạn chưa có địa chỉ giao hàng nào</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'password' && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-primary-900 mb-6">
                Đổi mật khẩu
              </h2>

              <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
                    <input
                      type="password"
                      {...registerPassword('password', {
                        required: 'Mật khẩu là bắt buộc',
                        minLength: {
                          value: 6,
                          message: 'Mật khẩu phải có ít nhất 6 ký tự',
                        },
                      })}
                      className="input-field pl-10"
                    />
                  </div>
                  {errorsPassword.password && (
                    <p className="mt-1 text-sm text-red-600">{errorsPassword.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Xác nhận mật khẩu mới
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
                    <input
                      type="password"
                      {...registerPassword('confirmPassword', {
                        required: 'Vui lòng xác nhận mật khẩu',
                        validate: (value) => value === password || 'Mật khẩu không khớp',
                      })}
                      className="input-field pl-10"
                    />
                  </div>
                  {errorsPassword.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errorsPassword.confirmPassword.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary flex items-center space-x-2"
                >
                  <FiSave />
                  <span>{isLoading ? 'Đang lưu...' : 'Đổi mật khẩu'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
      <FloatingChat />
    </div>
  );
};

export default Profile;
