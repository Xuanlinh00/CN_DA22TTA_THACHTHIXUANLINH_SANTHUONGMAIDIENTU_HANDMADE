const jwt = require('jsonwebtoken');
const User = require('../models/user.model.js');

// Middleware 1: Kiểm tra Token (Đã đăng nhập chưa?)
const protect = async (req, res, next) => {
    let token;

    // Đọc token từ cookie (chúng ta đã lưu nó tên là 'jwt')
    token = req.cookies.jwt;

    if (token) {
        try {
            // Xác thực token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Lấy thông tin user từ ID trong token (trừ mật khẩu)
            // và gắn nó vào request để các hàm sau có thể dùng
            req.user = await User.findById(decoded.userId).select('-password');

            next(); // Cho phép đi tiếp
        } catch (error) {
            console.error(error);
            res.status(401); // 401 = Unauthorized
            res.json({ message: 'Token không hợp lệ, truy cập bị từ chối' });
        }
    } else {
        res.status(401);
        res.json({ message: 'Không có token, truy cập bị từ chối' });
    }
};

// Middleware 2: Kiểm tra vai trò (Có phải Vendor không?)
const vendor = (req, res, next) => {
    if (req.user && req.user.role === 'vendor') {
        next(); // Là vendor, cho phép đi tiếp
    } else {
        res.status(403); // 403 = Forbidden
        res.json({ message: 'Không phải là Vendor, không có quyền truy cập' });
    }
};

// === THÊM MIDDLEWARE MỚI CHO ADMIN (THEO ĐỀ CƯƠNG) ===
// Middleware 3: Kiểm tra vai trò (Có phải Admin không?)
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next(); // Là admin, cho phép đi tiếp
    } else {
        res.status(403); // 403 = Forbidden
        res.json({ message: 'Không phải là Admin, không có quyền truy cập' });
    }
};
// ===================================================

// Cập nhật module.exports để export cả 3 hàm
module.exports = { protect, vendor, admin };