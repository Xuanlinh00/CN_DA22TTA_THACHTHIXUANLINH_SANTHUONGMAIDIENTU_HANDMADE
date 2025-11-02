// 1. Import các thư viện cần thiết
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/user.routes.js');
const shopRoutes = require('./routes/shop.routes.js');
const adminRoutes = require('./routes/admin.routes.js');

// 2. Cấu hình
dotenv.config(); // Đọc file .env
const app = express(); // Tạo app Express
app.use(cors()); // Cho phép React gọi API
app.use(express.json()); // Giúp server đọc hiểu dữ liệu JSON gửi lên
app.use(cookieParser()); // Giúp server đọc cookie (cho JWT)

// 3. Lấy thông tin từ file .env
const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI;

// 4. Kết nối CSDL MongoDB
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('ĐÃ KẾT NỐI THÀNH CÔNG ĐẾN MONGODB!');

        // 5. Chỉ khi kết nối CSDL thành công, server mới bắt đầu chạy
        app.listen(PORT, () => {
            console.log(`Server đang chạy trên cổng ${PORT}`);
        });
    })
    .catch(err => {
        console.error('LỖI KẾT NỐI MONGODB:', err.message);
    });

// 6. Routes
// Route (đường dẫn) API đầu tiên để kiểm tra
app.get('/', (req, res) => {
    res.send('Chào mừng đến với Back-end Sàn Handmade!');
});

// KÍCH HOẠT USER ROUTES
// Mọi đường dẫn bắt đầu bằng '/api/users' sẽ được xử lý bởi file userRoutes
app.use('/api/users', userRoutes);

// KÍCH HOẠT SHOP ROUTES
app.use('/api/shops', shopRoutes);

// KÍCH HOẠT ADMIN ROUTES
app.use('/api/admin', adminRoutes);