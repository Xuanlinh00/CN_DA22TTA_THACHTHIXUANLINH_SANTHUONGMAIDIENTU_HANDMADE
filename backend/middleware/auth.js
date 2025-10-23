// backend/middleware/auth.js

const jwt = require('jsonwebtoken');
// Lấy JWT_SECRET từ file server.js (hoặc file .env)
const JWT_SECRET = 'day_la_khoa_bi_mat_cuc_ky_an_toan'; 

function authMiddleware(req, res, next) {
    // 1. Lấy token từ header
    // Người dùng front-end sẽ gửi token theo dạng: 'Bearer [token]'
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ message: 'Truy cập bị từ chối. Không có token.' });
    }
    
    try {
        const token = authHeader.split(' ')[1]; // Tách lấy phần token
        
        // 2. Giải mã token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 3. Gắn thông tin user (đã giải mã) vào request
        // để các API phía sau có thể dùng
        req.user = decoded; // Sẽ chứa { userId: ..., role: 'vendor' }

        next(); // Cho phép đi tiếp
    } catch (error) {
        res.status(401).json({ message: 'Token không hợp lệ.' });
    }
}

module.exports = authMiddleware;