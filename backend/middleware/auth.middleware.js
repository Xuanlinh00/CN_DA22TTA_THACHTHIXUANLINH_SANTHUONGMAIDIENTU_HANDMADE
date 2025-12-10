const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({ message: "Bạn chưa đăng nhập." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Token không hợp lệ hoặc user không tồn tại." });
    }

    if (["banned", "inactive"].includes(user.status)) {
      return res.status(403).json({ message: "Tài khoản bị khoá hoặc chưa kích hoạt." });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Lỗi xác thực token:", err.message);
    return res.status(401).json({ message: "Token hết hạn hoặc không hợp lệ." });
  }
};

// Thêm hàm authorize ở đây
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Không xác thực được người dùng." });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Vai trò ${req.user.role} không có quyền thực hiện hành động này. Yêu cầu vai trò: ${roles.join(", ")}` 
      });
    }

    next();
  };
};

module.exports = { protect, authorize };  // Export cả hai