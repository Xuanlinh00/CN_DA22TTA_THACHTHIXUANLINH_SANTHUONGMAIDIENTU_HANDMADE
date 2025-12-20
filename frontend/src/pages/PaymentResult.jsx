import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';

const PaymentResult = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  const success = searchParams.get('success') === 'true';
  const orderId = searchParams.get('orderId');
  const orderNumber = searchParams.get('orderNumber');
  const message = searchParams.get('message');

  useEffect(() => {
    // Giả lập loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="w-16 h-16 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-primary-700">Đang xử lý kết quả thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {success ? (
            <>
              <FiCheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-primary-900 mb-2">
                Thanh toán thành công!
              </h1>
              <p className="text-primary-600 mb-6">
                Đơn hàng <span className="font-semibold">{orderNumber}</span> đã được thanh toán thành công.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate(`/orders/${orderId}`)}
                  className="w-full btn-primary"
                >
                  Xem chi tiết đơn hàng
                </button>
                <button
                  onClick={() => navigate('/orders')}
                  className="w-full btn-outline"
                >
                  Xem tất cả đơn hàng
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full text-primary-600 hover:text-primary-800"
                >
                  Về trang chủ
                </button>
              </div>
            </>
          ) : (
            <>
              <FiXCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-primary-900 mb-2">
                Thanh toán thất bại
              </h1>
              <p className="text-primary-600 mb-2">
                {message || 'Đã có lỗi xảy ra trong quá trình thanh toán.'}
              </p>
              {orderId && (
                <p className="text-sm text-primary-500 mb-6">
                  Đơn hàng của bạn vẫn được lưu. Bạn có thể thanh toán lại sau.
                </p>
              )}
              <div className="space-y-3">
                {orderId && (
                  <button
                    onClick={() => navigate(`/orders/${orderId}`)}
                    className="w-full btn-primary"
                  >
                    Xem đơn hàng
                  </button>
                )}
                <button
                  onClick={() => navigate('/cart')}
                  className="w-full btn-outline"
                >
                  Quay lại giỏ hàng
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full text-primary-600 hover:text-primary-800"
                >
                  Về trang chủ
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;
