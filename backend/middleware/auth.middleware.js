const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Middleware: Xác thực người dùng qua JWT
const protect = async (req, res, next) => {
  const token = req.cookies?.jwt;

  if (!token) {
    return res.status(401).json({ message: 'Không có token, truy cập bị từ chối' });
  }

  try {
    // Giải mã token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Lấy thông tin user từ DB
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Lỗi xác thực token:', error.message);
    return res.status(401).json({ message: 'Token không hợp lệ, truy cập bị từ chối' });
  }
};

// Middleware: Kiểm tra quyền admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Chỉ admin mới được phép' });
  }
};

// Middleware: Kiểm tra theo nhiều vai trò (nếu cần)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }
    next();
  };
};

module.exports = {
  protect,
  admin,
  authorize,
};
