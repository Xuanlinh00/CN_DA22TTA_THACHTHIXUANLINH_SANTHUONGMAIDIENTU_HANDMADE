const OrderProgressBar = ({ status, showLabels = false }) => {
  const steps = [
    { key: 'pending', label: 'Đặt hàng' },
    { key: 'confirmed', label: 'Xác nhận' },
    { key: 'processing', label: 'Chuẩn bị' },
    { key: 'shipping', label: 'Giao hàng' },
    { key: 'delivered', label: 'Hoàn thành' }
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.key === status);
  };

  const currentIndex = getCurrentStepIndex();
  const progress = currentIndex >= 0 ? ((currentIndex + 1) / steps.length) * 100 : 0;

  if (status === 'cancelled') {
    return (
      <div className="w-full">
        <div className="w-full bg-red-100 rounded-full h-2">
          <div className="bg-red-500 h-2 rounded-full w-full transition-all duration-300" />
        </div>
        {showLabels && (
          <div className="text-center mt-2">
            <span className="text-sm text-red-600 font-medium">Đã hủy</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {showLabels && (
        <div className="flex justify-between mt-2">
          {steps.map((step, index) => (
            <span 
              key={step.key}
              className={`text-xs ${
                index <= currentIndex 
                  ? 'text-green-600 font-medium' 
                  : 'text-gray-400'
              }`}
            >
              {step.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderProgressBar;