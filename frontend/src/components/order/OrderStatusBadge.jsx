import { FiPackage, FiTruck, FiCheckCircle, FiClock, FiX, FiAlertCircle } from 'react-icons/fi';

const OrderStatusBadge = ({ status, showIcon = true, size = 'md' }) => {
  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        label: 'Chờ xác nhận',
        icon: FiClock,
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-200'
      },
      confirmed: {
        label: 'Đã xác nhận',
        icon: FiCheckCircle,
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        borderColor: 'border-blue-200'
      },
      processing: {
        label: 'Đang chuẩn bị',
        icon: FiPackage,
        bgColor: 'bg-indigo-100',
        textColor: 'text-indigo-800',
        borderColor: 'border-indigo-200'
      },
      shipping: {
        label: 'Đang giao hàng',
        icon: FiTruck,
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-800',
        borderColor: 'border-purple-200'
      },
      delivered: {
        label: 'Đã giao hàng',
        icon: FiCheckCircle,
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-200'
      },
      cancelled: {
        label: 'Đã hủy',
        icon: FiX,
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-200'
      }
    };

    return configs[status] || {
      label: status,
      icon: FiAlertCircle,
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
      borderColor: 'border-gray-200'
    };
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };

  return (
    <span className={`
      inline-flex items-center space-x-1.5 rounded-full border font-medium
      ${config.bgColor} ${config.textColor} ${config.borderColor}
      ${sizeClasses[size]}
    `}>
      {showIcon && <Icon size={iconSizes[size]} />}
      <span>{config.label}</span>
    </span>
  );
};

export default OrderStatusBadge;