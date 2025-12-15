import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiUser, FiMail, FiLock, FiSave } from 'react-icons/fi';
import { authService } from '../services/authService';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

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
    </div>
  );
};

export default Profile;
