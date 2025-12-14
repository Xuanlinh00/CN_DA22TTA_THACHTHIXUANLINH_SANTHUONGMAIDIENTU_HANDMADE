import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiMail, FiLock, FiUser } from 'react-icons/fi';
import { authService } from '../../services/authService';
import useAuthStore from '../../stores/authStore';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      
      const token = response.token || localStorage.getItem('token');
      setAuth(response, token);
      
      toast.success('Đăng ký thành công!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold text-primary-900 mb-2">
            Đăng ký
          </h1>
          <p className="text-primary-600">
            Tạo tài khoản để bắt đầu mua sắm
          </p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Họ và tên
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
                <input
                  type="text"
                  {...register('name', {
                    required: 'Họ tên là bắt buộc',
                    minLength: {
                      value: 2,
                      message: 'Họ tên phải có ít nhất 2 ký tự',
                    },
                  })}
                  className="input-field pl-10"
                  placeholder="Nguyễn Văn A"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email là bắt buộc',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email không hợp lệ',
                    },
                  })}
                  className="input-field pl-10"
                  placeholder="your@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Mật khẩu
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
                Xác nhận mật khẩu
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

            {/* Terms */}
            <div className="flex items-start">
              <input
                type="checkbox"
                {...register('terms', {
                  required: 'Bạn phải đồng ý với điều khoản',
                })}
                className="mt-1 rounded border-primary-300 text-primary-700 focus:ring-primary-500"
              />
              <label className="ml-2 text-sm text-primary-600">
                Tôi đồng ý với{' '}
                <Link to="/terms" className="text-primary-700 hover:text-primary-900">
                  Điều khoản sử dụng
                </Link>{' '}
                và{' '}
                <Link to="/privacy" className="text-primary-700 hover:text-primary-900">
                  Chính sách bảo mật
                </Link>
              </label>
            </div>
            {errors.terms && (
              <p className="text-sm text-red-600">{errors.terms.message}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary"
            >
              {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-primary-600">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-primary-700 hover:text-primary-900 font-semibold">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
