// 1. Import các thư viện
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');

// 2. Load biến môi trường
dotenv.config();
const app = express();

// 3. Lấy biến từ .env
const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// 4. Kiểm tra kết nối MongoDB
if (!MONGO_URI) {
  console.error('❌ Thiếu MONGO_URI trong .env – vui lòng cấu hình');
  process.exit(1);
}

// 5. Middleware bảo mật & tiện ích
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 6. Cấu hình CORS cho frontend (cho phép cả port 5173 và 5174)
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

// XÓA: app.options('*', cors());
// Nếu cần preflight riêng cho API:
//app.options('/api/*', cors());

// 7. Nếu deploy sau này (behind proxy như Nginx)
app.set('trust proxy', 1);

// 7.5. Serve static files từ uploads directory
app.use('/uploads', express.static('uploads'));

// 8. Kết nối MongoDB
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Kết nối MongoDB thành công');
    app.listen(PORT, () => {
      console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
      console.log(`🔗 CORS cho phép từ: ${CLIENT_URL}`);
    });
  })
  .catch(err => {
    console.error('❌ Lỗi kết nối MongoDB:', err.message);
    process.exit(1);
  });

// 9. Route kiểm tra
app.get('/', (req, res) => {
  res.send('🧵 API Craftify Handmade đang hoạt động...');
});

// 10. Import routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/cart', require('./routes/cart.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/shops', require('./routes/shop.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/payment', require('./routes/payment.routes'));
app.use('/api/shipping', require('./routes/shipping.routes'));

// 11. Xử lý lỗi 404
app.use((req, res, next) => {
  const error = new Error(`Không tìm thấy endpoint: ${req.originalUrl}`);
  error.status = 404;
  next(error);
});

// 12. Global Error Handler
app.use((err, req, res, next) => {
  console.error('🔥 ERROR:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Lỗi máy chủ nội bộ',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});
