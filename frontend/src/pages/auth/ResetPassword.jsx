import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiLock, FiCheck, FiX } from 'react-icons/fi';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Mật khẩu không khớp');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(token, data.password);
      setResetSuccess(true);
      toast.success('Đặt lại mật khẩu thành công!');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  if (resetSuccess) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheck className="text-green-600" size={32} />
            </div>
            
            <h1 className="text-2xl font-display font-bold text-primary-900 mb-4">
              Thành Công!
            </h1>
            
            <p className="text-primary-600 mb-8">
              Mật khẩu của bạn đã được đặt lại thành công. Bạn sẽ được chuyển hướng đến trang đăng nhập...
            </p>
            
            <Link to="/login" className="btn-primary w-full">
              Đăng Nhập Ngay
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold text-primary-900 mb-2">
            Đặt Lại Mật Khẩu
          </h1>
          <p className="text-primary-600">
            Nhập mật khẩu mới của bạn
          </p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Mật Khẩu Mới
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
                <input
                  type="password"
                  {...register('password', {
                    required: 'Mật khẩu là bắt buộc',
                    minLength: {
                      value: 6,
                      message: 'Mật khẩu phải có ít nhất 6 ký tự',
                    },
                  })}
                  className="input-field pl-10"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Xác Nhận Mật Khẩu
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
                <input
                  type="password"
                  {...register('confirmPassword', {
                    required: 'Vui lòng xác nhận mật khẩu',
                    validate: (value) =>
                      value === password || 'Mật khẩu không khớp',
                  })}
                  className="input-field pl-10"
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="bg-primary-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-primary-900 mb-2">Yêu cầu mật khẩu:</p>
              <ul className="space-y-1 text-sm text-primary-700">
                <li className="flex items-center">
                  {password?.length >= 6 ? (
                    <FiCheck className="text-green-600 mr-2" size={16} />
                  ) : (
                    <FiX className="text-red-600 mr-2" size={16} />
                  )}
                  Ít nhất 6 ký tự
                </li>
                <li className="flex items-center">
                  {password === watch('confirmPassword') && password ? (
                    <FiCheck className="text-green-600 mr-2" size={16} />
                  ) : (
                    <FiX className="text-red-600 mr-2" size={16} />
                  )}
                  Mật khẩu khớp
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary"
            >
              {isLoading ? 'Đang xử lý...' : 'Đặt Lại Mật Khẩu'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-primary-600">
              Nhớ mật khẩu rồi?{' '}
              <Link to="/login" className="text-primary-700 hover:text-primary-900 font-semibold">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
