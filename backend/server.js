// server.js

// 1. Import các thư viện
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');

// 2. Cấu hình
dotenv.config();
const app = express();

// 3. Lấy env
const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Cảnh báo nếu thiếu MONGO_URI
if (!MONGO_URI) {
  console.error('Thiếu MONGO_URI trong .env – vui lòng cấu hình trước khi chạy server');
  process.exit(1);
}

// 4. Middleware bảo mật & tiện ích
app.use(helmet());
app.use(morgan('dev'));

// ❗ Bật CORS với credentials để dùng cookie JWT (SameSite=Lax/None tùy HTTPS)
app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}));

// Parsing body và cookie
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Nếu deploy sau này (behind proxy) để set cookie chính xác
app.set('trust proxy', 1);

// 5. Kết nối MongoDB
mongoose.connect(MONGO_URI, { autoIndex: true })
  .then(() => {
    console.log('ĐÃ KẾT NỐI THÀNH CÔNG ĐẾN MONGODB!');
    app.listen(PORT, () => {
      console.log(`Server đang chạy trên cổng ${PORT}`);
      console.log(`CORS cho front-end: ${CLIENT_URL}`);
    });
  })
  .catch(err => {
    console.error('LỖI KẾT NỐI MONGODB:', err.message);
    process.exit(1);
  });

// 6. Routes cơ bản
app.get('/', (req, res) => {
  res.send('Chào mừng đến với Back-end Sàn Handmade!');
});

// Import routes
const userRoutes = require('./routes/user.routes.js');
const shopRoutes = require('./routes/shop.routes.js');
const adminRoutes = require('./routes/admin.routes.js');
const productRoutes = require('./routes/product.routes.js');
const categoryRoutes = require('./routes/category.routes.js');
const cartRoutes = require('./routes/cart.routes.js');
const orderRoutes = require('./routes/order.routes.js');

// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// 7. 404 và xử lý lỗi chung
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Không tìm thấy endpoint'
  });
});

app.use((err, req, res, next) => {
  console.error('ERROR:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Lỗi máy chủ nội bộ'
  });
});
