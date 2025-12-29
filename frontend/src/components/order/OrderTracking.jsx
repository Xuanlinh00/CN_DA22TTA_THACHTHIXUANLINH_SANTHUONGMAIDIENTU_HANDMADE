import { FiPackage, FiTruck, FiCheckCircle, FiClock, FiX } from 'react-icons/fi';
import { formatDateTime } from '../../utils/formatters';

const OrderTracking = ({ order }) => {
  const getStepCurrentClasses = (color) => {
    const colorClasses = {
      blue: 'border-blue-500 bg-blue-100 text-blue-600',
      green: 'border-green-500 bg-green-100 text-green-600',
      yellow: 'border-yellow-500 bg-yellow-100 text-yellow-600',
      red: 'border-red-500 bg-red-100 text-red-600',
      purple: 'border-purple-500 bg-purple-100 text-purple-600',
      orange: 'border-orange-500 bg-orange-100 text-orange-600',
    };
    return colorClasses[color] || 'border-gray-500 bg-gray-100 text-gray-600';
  };

  const getCompletedClasses = (color) => {
    const colorClasses = {
      blue: 'border-blue-500 bg-blue-500 text-white',
      green: 'border-green-500 bg-green-500 text-white',
      yellow: 'border-yellow-500 bg-yellow-500 text-white',
      red: 'border-red-500 bg-red-500 text-white',
      purple: 'border-purple-500 bg-purple-500 text-white',
      orange: 'border-orange-500 bg-orange-500 text-white',
    };
    return colorClasses[color] || 'border-gray-500 bg-gray-500 text-white';
  };

  const getLineColor = (color) => {
    const colorClasses = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
    };
    return colorClasses[color] || 'bg-gray-500';
  };

  const getStatusSteps = () => {
    const allSteps = [
      {
        key: 'pending',
        label: 'Đơn hàng đã đặt',
        description: 'Đơn hàng của bạn đã được tạo thành công',
        icon: FiClock,
        color: 'blue'
      },
      {
        key: 'confirmed',
        label: 'Đã xác nhận',
        description: 'Cửa hàng đã xác nhận đơn hàng',
        icon: FiCheckCircle,
        color: 'purple'
      },
      {
        key: 'processing',
        label: 'Đang chuẩn bị',
        description: 'Cửa hàng đang chuẩn bị sản phẩm',
        icon: FiPackage,
        color: 'orange'
      },
      {
        key: 'shipping',
        label: 'Đang giao hàng',
        description: 'Đơn hàng đang được vận chuyển',
        icon: FiTruck,
        color: 'yellow'
      },
      {
        key: 'delivered',
        label: 'Đã giao hàng',
        description: 'Đơn hàng đã được giao thành công',
        icon: FiCheckCircle,
        color: 'green'
      }
    ];

    // Nếu đơn hàng bị hủy, chỉ hiển thị bước hủy
    if (order.status === 'cancelled') {
      return [
        {
          key: 'cancelled',
          label: 'Đơn hàng đã hủy',
          description: order.cancelReason || 'Đơn hàng đã bị hủy',
          icon: FiX,
          color: 'red'
        }
      ];
    }

    return allSteps;
  };

  const getCurrentStepIndex = () => {
    const steps = getStatusSteps();
    return steps.findIndex(step => step.key === order.status);
  };

  const getStepStatus = (stepIndex, currentIndex) => {
    if (order.status === 'cancelled') {
      return stepIndex === 0 ? 'current' : 'pending';
    }
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  const steps = getStatusSteps();
  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-primary-900 mb-6">
        Theo dõi đơn hàng
      </h3>

      <div className="relative">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const stepStatus = getStepStatus(index, currentStepIndex);
          const isLast = index === steps.length - 1;

          return (
            <div key={step.key} className="relative flex items-start">
              {/* Vertical Line */}
              {!isLast && (
                <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-300">
                  <div 
                    className={`w-full transition-all duration-500 ${
                      stepStatus === 'completed' ? getLineColor(step.color) : 'h-0'
                    }`}
                  />
                </div>
              )}

              {/* Step Content */}
              <div className="flex items-start space-x-4 pb-8">
                {/* Icon */}
                <div className={`
                  flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300
                  ${stepStatus === 'completed' 
                    ? getCompletedClasses(step.color)
                    : stepStatus === 'current'
                    ? getStepCurrentClasses(step.color)
                    : 'border-gray-300 bg-gray-100 text-gray-400'
                  }
                  ${order.status === 'cancelled' && step.key === 'cancelled' 
                    ? 'border-red-500 bg-red-500 text-white' 
                    : ''
                  }
                `}>
                  <Icon size={20} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-medium ${
                      stepStatus === 'completed' || stepStatus === 'current'
                        ? 'text-primary-900'
                        : 'text-gray-500'
                    }`}>
                      {step.label}
                    </h4>
                    
                    {stepStatus === 'completed' && (
                      <span className="text-sm text-gray-500">
                        {formatDateTime(order.createdAt)}
                      </span>
                    )}
                    
                    {stepStatus === 'current' && (
                      <span className="text-sm font-medium text-blue-600">
                        Hiện tại
                      </span>
                    )}
                  </div>
                  
                  <p className={`text-sm mt-1 ${
                    stepStatus === 'completed' || stepStatus === 'current'
                      ? 'text-primary-600'
                      : 'text-gray-400'
                  }`}>
                    {step.description}
                  </p>

                  {/* Thời gian cụ thể cho từng bước */}
                  {stepStatus === 'completed' && (
                    <div className="mt-2 text-xs text-gray-500">
                      {step.key === 'pending' && order.createdAt && (
                        <span>Đặt hàng lúc: {formatDateTime(order.createdAt)}</span>
                      )}
                      {step.key === 'confirmed' && order.confirmedAt && (
                        <span>Xác nhận lúc: {formatDateTime(order.confirmedAt)}</span>
                      )}
                      {step.key === 'shipping' && order.shippedAt && (
                        <span>Giao hàng lúc: {formatDateTime(order.shippedAt)}</span>
                      )}
                      {step.key === 'delivered' && order.deliveredAt && (
                        <span>Hoàn thành lúc: {formatDateTime(order.deliveredAt)}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Thông tin vận chuyển */}
      {order.shippingMethod && (
        <div className="mt-6 pt-6 border-t border-primary-200">
          <h4 className="font-medium text-primary-900 mb-3">Thông tin vận chuyển</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-primary-600">Phương thức:</span>
              <span className="text-primary-900">{order.shippingMethod.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-primary-600">Nhà vận chuyển:</span>
              <span className="text-primary-900">{order.shippingMethod.provider}</span>
            </div>
            {order.shippingMethod.trackingCode && (
              <div className="flex justify-between">
                <span className="text-primary-600">Mã vận đơn:</span>
                <span className="text-primary-900 font-mono">{order.shippingMethod.trackingCode}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-primary-600">Phí vận chuyển:</span>
              <span className="text-primary-900">{order.shippingFee?.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>
        </div>
      )}

      {/* Ước tính thời gian giao hàng */}
      {order.status !== 'delivered' && order.status !== 'cancelled' && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <FiTruck className="text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Dự kiến giao hàng: 
              {order.shippingMethod?.estimatedDays 
                ? ` ${order.shippingMethod.estimatedDays} ngày`
                : ' 3-5 ngày'
              }
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;