// Format currency VND
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

// Format date
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

// Format datetime
export const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Get order status label
export const getOrderStatusLabel = (status) => {
  const labels = {
    pending_payment: 'Chờ thanh toán',
    processing: 'Đang xử lý',
    shipped: 'Đang giao',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
  };
  return labels[status] || status;
};

// Get order status color
export const getOrderStatusColor = (status) => {
  const colors = {
    pending_payment: 'warning',
    processing: 'info',
    shipped: 'info',
    completed: 'success',
    cancelled: 'danger',
  };
  return colors[status] || 'info';
};

// Get shop status label
export const getShopStatusLabel = (status) => {
  const labels = {
    pending: 'Chờ duyệt',
    active: 'Hoạt động',
    rejected: 'Bị từ chối',
  };
  return labels[status] || status;
};
