import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { paymentService } from '../../services/paymentService';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';

const VNPayReturn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [orderInfo, setOrderInfo] = useState(null);

  useEffect(() => {
    const handleVNPayReturn = async () => {
      try {
        // Chuyển searchParams thành object
        const params = Object.fromEntries(searchParams);
        
        // Gọi API xác nhận thanh toán
        const response = await paymentService.vnpayReturn(params);
        
        if (response.success) {
          setStatus('success');
          setOrderInfo(response.data);
          toast.success('Thanh toán thành công!');
          
          // Redirect sau 3 giây
          setTimeout(() => {
            navigate(`/orders/${response.data.orderNumber}`);
          }, 3000);
        } else {
          setStatus('failed');
          setOrderInfo(response.data);
          toast.error(response.message || 'Thanh toán thất bại');
          
          // Redirect sau 3 giây
          setTimeout(() => {
            navigate('/checkout');
          }, 3000);
        }
      } catch (error) {
        setStatus('error');
        toast.error(error.response?.data?.message || 'Lỗi xử lý thanh toán');
        
        // Redirect sau 3 giây
        setTimeout(() => {
          navigate('/checkout');
        }, 3000);
      }
    };

    handleVNPayReturn();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="card p-8 text-center">
          {status === 'loading' && (
            <>
              <FiLoader className="mx-auto text-primary-600 mb-4 animate-spin" size={48} />
              <h2 className="text-2xl font-bold text-primary-900 mb-2">
                Đang xử lý thanh toán
              </h2>
              <p className="text-primary-600">
                Vui lòng chờ trong giây lát...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <FiCheckCircle className="mx-auto text-green-600 mb-4" size={48} />
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                Thanh toán thành công!
              </h2>
              <p className="text-primary-600 mb-4">
                Mã đơn hàng: <span className="font-semibold">{orderInfo?.orderNumber}</span>
              </p>
              <p className="text-sm text-primary-500">
                Đang chuyển hướng đến trang chi tiết đơn hàng...
              </p>
            </>
          )}

          {status === 'failed' && (
            <>
              <FiXCircle className="mx-auto text-red-600 mb-4" size={48} />
              <h2 className="text-2xl font-bold text-red-600 mb-2">
                Thanh toán thất bại
              </h2>
              <p className="text-primary-600 mb-4">
                {orderInfo?.responseCode === '00' 
                  ? 'Giao dịch đã được xử lý'
                  : 'Vui lòng thử lại hoặc liên hệ hỗ trợ'}
              </p>
              <p className="text-sm text-primary-500">
                Đang chuyển hướng về trang thanh toán...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <FiXCircle className="mx-auto text-red-600 mb-4" size={48} />
              <h2 className="text-2xl font-bold text-red-600 mb-2">
                Lỗi xử lý
              </h2>
              <p className="text-primary-600 mb-4">
                Có lỗi xảy ra khi xử lý thanh toán
              </p>
              <p className="text-sm text-primary-500">
                Đang chuyển hướng về trang thanh toán...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VNPayReturn;
