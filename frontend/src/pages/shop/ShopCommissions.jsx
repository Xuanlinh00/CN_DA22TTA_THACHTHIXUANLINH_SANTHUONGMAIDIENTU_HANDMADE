import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { shopService } from '../../services/shopService';
import { formatCurrency } from '../../utils/formatters';
import Loading from '../../components/common/Loading';
import ShopLayout from '../../components/layout/ShopLayout';
import { FiDollarSign, FiClock, FiCheck, FiSend, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ShopCommissions = () => {
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [bankInfo, setBankInfo] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: ''
  });

  const { data: shopData, isLoading: shopLoading } = useQuery({
    queryKey: ['my-shop'],
    queryFn: shopService.getMyShop,
  });

  const { data: commissionData, isLoading: commissionLoading, refetch } = useQuery({
    queryKey: ['shop-commission'],
    queryFn: shopService.getCommission,
  });

  const withdrawMutation = useMutation({
    mutationFn: (data) => shopService.requestWithdrawal(data),
    onSuccess: () => {
      toast.success('Yêu cầu rút tiền đã được gửi. Admin sẽ xử lý trong 1-3 ngày làm việc.');
      setShowWithdrawForm(false);
      setWithdrawAmount('');
      setBankInfo({ bankName: '', accountNumber: '', accountHolder: '' });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Lỗi khi gửi yêu cầu rút tiền');
    }
  });

  const paymentMutation = useMutation({
    mutationFn: (data) => shopService.payCommission(data),
    onSuccess: () => {
      toast.success('Yêu cầu thanh toán hoa hồng đã được gửi. Admin sẽ xử lý trong 1-3 ngày làm việc.');
      setShowPaymentForm(false);
      setPaymentAmount('');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Lỗi khi gửi yêu cầu thanh toán');
    }
  });

  const handleWithdraw = (e) => {
    e.preventDefault();
    
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    if (!bankInfo.bankName || !bankInfo.accountNumber || !bankInfo.accountHolder) {
      toast.error('Vui lòng điền đầy đủ thông tin ngân hàng');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    const available = (commissionData?.data?.totalCommission || 0) - (commissionData?.data?.paidCommission || 0);

    if (amount > available) {
      toast.error(`Số tiền rút không được vượt quá ${formatCurrency(available)}`);
      return;
    }

    withdrawMutation.mutate({
      amount,
      bankInfo
    });
  };

  const handlePayment = (e) => {
    e.preventDefault();
    
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    const amount = parseFloat(paymentAmount);
    const owedCommission = commissionData?.data?.totalCommission || 0;

    if (amount > owedCommission) {
      toast.error(`Số tiền thanh toán không được vượt quá ${formatCurrency(owedCommission)}`);
      return;
    }

    paymentMutation.mutate({
      amount
    });
  };

  if (shopLoading || commissionLoading) return <Loading fullScreen />;

  const commission = commissionData?.data || {};
  const totalCommission = commission.totalCommission || 0; // Tổng hoa hồng phải trả cho admin
  const paidCommission = commission.paidCommission || 0; // Đã trả cho admin
  const commissionEarned = commission.commissionEarned || 0; // Hoa hồng kiếm được (có thể rút)

  return (
    <ShopLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-sans font-bold text-primary-900 mb-2">
            Quản lý hoa hồng
          </h1>
          <p className="text-primary-600">Xem hoa hồng kiếm được và thanh toán hoa hồng cho quản trị viên</p>
        </div>

        {/* Commission Owed Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-primary-900">💳 Hoa hồng phải trả cho quản trị</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6 bg-gradient-to-br from-red-50 to-red-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-200 rounded-lg">
                  <FiAlertCircle className="text-red-700" size={24} />
                </div>
                <span className="text-xs font-semibold text-red-600 bg-red-200 px-2 py-1 rounded">
                  ⚠️ Phải trả
                </span>
              </div>
              <p className="text-3xl font-bold text-red-900 mb-1">
                {formatCurrency(totalCommission)}
              </p>
              <p className="text-sm text-red-700">Tổng hoa hồng phải trả</p>
            </div>

            <div className="card p-6 bg-gradient-to-br from-orange-50 to-orange-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-200 rounded-lg">
                  <FiCheck className="text-orange-700" size={24} />
                </div>
                <span className="text-xs font-semibold text-orange-600 bg-orange-200 px-2 py-1 rounded">
                  ✅ Đã trả
                </span>
              </div>
              <p className="text-3xl font-bold text-orange-900 mb-1">
                {formatCurrency(paidCommission)}
              </p>
              <p className="text-sm text-orange-700">Hoa hồng đã thanh toán</p>
            </div>

            <div className="card p-6 bg-gradient-to-br from-yellow-50 to-yellow-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-200 rounded-lg">
                  <FiClock className="text-yellow-700" size={24} />
                </div>
                <span className="text-xs font-semibold text-yellow-600 bg-yellow-200 px-2 py-1 rounded">
                  ⏳ Còn nợ
                </span>
              </div>
              <p className="text-3xl font-bold text-yellow-900 mb-1">
                {formatCurrency(totalCommission - paidCommission)}
              </p>
              <p className="text-sm text-yellow-700">Hoa hồng còn phải trả</p>
            </div>
          </div>

          {/* Payment Section */}
          {totalCommission - paidCommission > 0 && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-primary-900">
                  💰 Thanh toán hoa hồng
                </h3>
                {!showPaymentForm && (
                  <button
                    onClick={() => setShowPaymentForm(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <FiSend size={18} />
                    Thanh toán
                  </button>
                )}
              </div>

              {showPaymentForm && (
                <form onSubmit={handlePayment} className="space-y-4 border-t border-primary-200 pt-6">
                  <div>
                    <label className="block text-sm font-medium text-primary-900 mb-2">
                      Số tiền thanh toán (tối đa: {formatCurrency(totalCommission - paidCommission)})
                    </label>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="Nhập số tiền"
                      max={totalCommission - paidCommission}
                      step="1000"
                      className="w-full px-4 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-primary-200">
                    <button
                      type="submit"
                      disabled={paymentMutation.isPending}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <FiSend size={18} />
                      {paymentMutation.isPending ? 'Đang xử lý...' : 'Gửi yêu cầu thanh toán'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPaymentForm(false);
                        setPaymentAmount('');
                      }}
                      className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
                    >
                      Hủy
                    </button>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-900">
                    <p className="font-semibold mb-1">⚠️ Lưu ý:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Thanh toán hoa hồng cho quản trị viên ngay lập tức</li>
                      <li>Vui lòng chuyển khoản đến tài khoản của quản trị viên</li>
                      <li>Hoa hồng phải trả: 5% từ mỗi đơn hàng hoàn thành</li>
                    </ul>
                  </div>
                </form>
              )}
            </div>
          )}

          {totalCommission - paidCommission === 0 && (
            <div className="card p-6 text-center bg-green-50 border border-green-200">
              <p className="text-green-700 font-medium">
                ✅ Bạn đã thanh toán đầy đủ hoa hồng cho quản trị viên
              </p>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-primary-200"></div>

        {/* Info Section */}
        <div className="card p-6 bg-blue-50 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">ℹ️ Thông tin về hoa hồng</h3>
          <div className="space-y-3 text-sm text-blue-800">
            <p>
              <strong>Hoa hồng phải trả:</strong> Là khoản phí mà bạn phải thanh toán cho quản trị viên từ mỗi đơn hàng hoàn thành (5% giá trị đơn hàng).
            </p>
            <p>
              <strong>Khi nào tính hoa hồng?</strong> Hoa hồng sẽ được tính khi đơn hàng có trạng thái "Đã giao".
            </p>
            <p>
              <strong>Cách thanh toán:</strong> Bạn có thể thanh toán hoa hồng bất kỳ lúc nào. Tiền sẽ được chuyển vào tài khoản của quản trị viên.
            </p>
          </div>
        </div>
      </div>
    </ShopLayout>
  );
};

export default ShopCommissions;
