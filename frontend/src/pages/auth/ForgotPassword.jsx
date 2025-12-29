import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axios from '../../utils/axios';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Vui lòng nhập email');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('/auth/forgot-password', { email });
      
      if (response.data.success) {
        setSubmitted(true);
        toast.success('Email xác nhận đã được gửi!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-900 mb-8 transition-colors"
        >
          <FiArrowLeft size={20} />
          <span>Quay lại đăng nhập</span>
        </button>

        <div className="card p-8">
          {!submitted ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiMail size={32} className="text-accent-600" />
                </div>
                <h1 className="text-3xl font-bold text-primary-900 mb-2">
                  Quên mật khẩu?
                </h1>
                <p className="text-primary-600">
                  Nhập email của bạn để nhận link đặt lại mật khẩu
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập email của bạn"
                    className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Đang gửi...' : 'Gửi link xác nhận'}
                </button>
              </form>

              {/* Info */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 Kiểm tra email của bạn (bao gồm thư mục spam) để nhận link đặt lại mật khẩu. Link sẽ hết hạn sau 10 phút.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Success Message */}
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-primary-900 mb-2">
                  Email đã được gửi!
                </h2>
                <p className="text-primary-600 mb-6">
                  Vui lòng kiểm tra email <span className="font-semibold">{email}</span> để nhận link đặt lại mật khẩu.
                </p>

                <div className="space-y-3 mb-6">
                  <p className="text-sm text-primary-600">
                    ⏱️ Link sẽ hết hạn sau <span className="font-semibold">10 phút</span>
                  </p>
                  <p className="text-sm text-primary-600">
                    📧 Không tìm thấy email? Kiểm tra thư mục <span className="font-semibold">Spam</span>
                  </p>
                </div>

                <button
                  onClick={() => navigate('/login')}
                  className="w-full btn-primary"
                >
                  Quay lại đăng nhập
                </button>

                <button
                  onClick={() => {
                    setSubmitted(false);
                    setEmail('');
                  }}
                  className="w-full btn-outline mt-3"
                >
                  Gửi lại email
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
