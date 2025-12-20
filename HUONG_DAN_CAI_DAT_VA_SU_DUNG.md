# HƯỚNG DẪN CÀI ĐẶT VÀ SỬ DỤNG HỆ THỐNG CRAFTIFY HANDMADE

## 📋 TỔNG QUAN DỰ ÁN

**Craftify Handmade** là một nền tảng thương mại điện tử chuyên về sản phẩm handmade, cho phép:
- Khách hàng mua sắm sản phẩm handmade
- Chủ shop đăng ký và bán sản phẩm
- Admin quản lý toàn bộ hệ thống

### 🏗️ Kiến trúc hệ thống
- **Frontend**: React 18 + Vite + TailwindCSS
- **Backend**: Node.js + Express + MongoDB
- **Database**: MongoDB
- **Authentication**: JWT
- **Payment**: VNPay (Sandbox)
- **File Upload**: Multer + Local Storage

---

## 🛠️ CÔNG CỤ CẦN THIẾT

### 1. Phần mềm bắt buộc
```bash
# Node.js (phiên bản 16 trở lên)
https://nodejs.org/

# MongoDB Community Server
https://www.mongodb.com/try/download/community

# Git
https://git-scm.com/

# Code Editor (khuyến nghị VS Code)
https://code.visualstudio.com/
```

### 2. Công cụ hỗ trợ
```bash
# MongoDB Compass (GUI cho MongoDB)
https://www.mongodb.com/products/compass

# Postman (Test API)
https://www.postman.com/

# Nodemon (Auto restart server)
npm install -g nodemon
```

---

## 📦 CÀI ĐẶT HỆ THỐNG

### Bước 1: Clone dự án
```bash
git clone <repository-url>
cd doanchuyennganh_handmade
```

### Bước 2: Cài đặt Backend
```bash
cd backend
npm install
```

### Bước 3: Cài đặt Frontend
```bash
cd ../frontend
npm install
```

### Bước 4: Cấu hình Database
1. Khởi động MongoDB service
2. Tạo database `craftify_handmade`
3. Kiểm tra kết nối tại `mongodb://127.0.0.1:27017/craftify_handmade`

### Bước 5: Cấu hình Environment Variables

#### Backend (.env)
```env
# Server
PORT=8000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/craftify_handmade

# Security
JWT_SECRET=craftify_handmade_secret_2024
JWT_EXPIRE=30d

# Admin
ADMIN_EMAIL=admin@craftify.com
ADMIN_PASSWORD=admin123456

# Frontend
CLIENT_URL=http://localhost:5173

# VNPay Payment (Sandbox)
VNPAY_TMN_CODE=LWXCNYOK
VNPAY_HASH_SECRET=QPGTQ7HWPCBXCCI5WKIBPJWXZK40LTVK
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:5173/payment/vnpay-return

# Commission
DEFAULT_COMMISSION_RATE=0.05
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=Craftify Handmade
```

---

## 🚀 KHỞI CHẠY HỆ THỐNG

### 1. Khởi động Backend
```bash
cd backend
npm run dev
# Server chạy tại: http://localhost:8000
```

### 2. Khởi động Frontend
```bash
cd frontend
npm run dev
# Frontend chạy tại: http://localhost:5173
```

### 3. Kiểm tra kết nối
- Backend: http://localhost:8000
- Frontend: http://localhost:5173
- API Health: http://localhost:8000/api

---

## 👥 TÀI KHOẢN MẶC ĐỊNH

### Admin
- Email: `admin@craftify.com`
- Password: `admin123456`

### Test User (tạo qua đăng ký)
- Có thể đăng ký tài khoản mới
- Hoặc tạo qua API

---

## 🎯 TÍNH NĂNG CHÍNH ĐÃ THỰC HIỆN

### 1. Hệ thống Authentication & Authorization
- ✅ Đăng ký/Đăng nhập người dùng
- ✅ JWT Authentication
- ✅ Role-based access (user, shop_owner, admin)
- ✅ Protected routes
- ✅ Password hashing với bcrypt

### 2. Quản lý Sản phẩm
- ✅ CRUD sản phẩm
- ✅ Upload hình ảnh (multiple images)
- ✅ Phân loại theo danh mục
- ✅ Tìm kiếm fuzzy search
- ✅ Lọc theo giá, danh mục, shop
- ✅ Pagination

### 3. Hệ thống Shop
- ✅ Đăng ký cửa hàng
- ✅ Quản lý sản phẩm shop
- ✅ Dashboard thống kê
- ✅ Quản lý đơn hàng
- ✅ Cập nhật trạng thái đơn hàng

### 4. Giỏ hàng & Đặt hàng
- ✅ Thêm/xóa sản phẩm khỏi giỏ hàng
- ✅ Cập nhật số lượng
- ✅ Checkout process
- ✅ Tính toán tổng tiền
- ✅ Quản lý địa chỉ giao hàng

### 5. Hệ thống Thanh toán
- ✅ Thanh toán COD (Cash on Delivery)
- ✅ Tích hợp VNPay (Sandbox)
- ✅ Xử lý callback payment
- ✅ Cập nhật trạng thái thanh toán

### 6. Quản lý Đơn hàng
- ✅ Tạo đơn hàng
- ✅ Theo dõi trạng thái
- ✅ Lịch sử đơn hàng
- ✅ Chi tiết đơn hàng
- ✅ Cập nhật trạng thái (pending → confirmed → shipped → delivered)

### 7. Admin Dashboard
- ✅ Quản lý người dùng
- ✅ Quản lý cửa hàng (duyệt/từ chối)
- ✅ Quản lý sản phẩm
- ✅ Quản lý đơn hàng
- ✅ Quản lý danh mục
- ✅ Thống kê tổng quan

### 8. Frontend Features
- ✅ Responsive design với TailwindCSS
- ✅ State management với Zustand
- ✅ API caching với React Query
- ✅ Form validation với React Hook Form
- ✅ Toast notifications
- ✅ Loading states
- ✅ Error handling

### 9. Security & Performance
- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ Request validation
- ✅ File upload security
- ✅ Rate limiting (có thể thêm)
- ✅ Error handling middleware

---

## 📁 CẤU TRÚC DỰ ÁN

```
doanchuyennganh_handmade/
├── backend/                    # Node.js Backend
│   ├── controllers/           # Business logic
│   ├── models/               # MongoDB schemas
│   ├── routes/               # API routes
│   ├── middleware/           # Custom middleware
│   ├── services/             # Business services
│   ├── utils/                # Utility functions
│   ├── scripts/              # Database scripts
│   ├── uploads/              # File uploads
│   └── server.js             # Entry point
├── frontend/                  # React Frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── stores/          # Zustand stores
│   │   ├── utils/           # Utility functions
│   │   └── App.jsx          # Main component
│   └── public/              # Static assets
└── images/                   # Project images
```

---

## 🔧 SCRIPTS QUAN TRỌNG

### Backend Scripts
```bash
npm start          # Chạy production
npm run dev        # Chạy development với nodemon
npm run seed       # Seed categories vào database
```

### Frontend Scripts
```bash
npm run dev        # Chạy development server
npm run build      # Build production
npm run preview    # Preview production build
npm run lint       # Lint code
```

---

## 🌐 API ENDPOINTS CHÍNH

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Lấy thông tin user
- `PUT /api/auth/profile` - Cập nhật profile

### Products
- `GET /api/products` - Lấy danh sách sản phẩm
- `GET /api/products/:id` - Chi tiết sản phẩm
- `POST /api/products` - Tạo sản phẩm (shop owner)
- `PUT /api/products/:id` - Cập nhật sản phẩm
- `DELETE /api/products/:id` - Xóa sản phẩm

### Orders
- `GET /api/orders` - Lấy đơn hàng của user
- `POST /api/orders` - Tạo đơn hàng
- `GET /api/orders/:id` - Chi tiết đơn hàng
- `PUT /api/orders/:id/status` - Cập nhật trạng thái

### Shops
- `POST /api/shops` - Đăng ký shop
- `GET /api/shops` - Danh sách shop
- `GET /api/shops/:id` - Chi tiết shop
- `PUT /api/shops/:id` - Cập nhật shop

### Admin
- `GET /api/admin/users` - Quản lý users
- `GET /api/admin/shops` - Quản lý shops
- `PUT /api/admin/shops/:id/approve` - Duyệt shop
- `GET /api/admin/stats` - Thống kê

---

## 🎨 GIAO DIỆN & THEME

### Color Palette
- **Primary Brown**: #43302b (Dark Brown)
- **Light Brown**: #fdf8f6 (Background)
- **Accent Orange**: #e89005 (Buttons, Links)
- **Light Orange**: #fef3e2 (Highlights)

### Typography
- **Primary Font**: Inter
- **Heading Font**: Playfair Display

### Components
- Responsive design cho mobile/tablet/desktop
- Modern card-based layout
- Consistent spacing và typography
- Accessible form controls
- Loading states và error handling

---

## 📱 RESPONSIVE DESIGN

Hệ thống được thiết kế responsive với breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

Tất cả components đều tối ưu cho các kích thước màn hình khác nhau.

---

## 🔒 BẢO MẬT

### Implemented Security Features
- JWT token authentication
- Password hashing với bcrypt
- CORS configuration
- Helmet security headers
- Input validation
- File upload restrictions
- Protected API routes
- Role-based access control

### Security Best Practices
- Environment variables cho sensitive data
- Secure cookie settings
- Request rate limiting (có thể thêm)
- SQL injection prevention (MongoDB)
- XSS protection

---

## 📊 MONITORING & LOGGING

- Morgan HTTP request logging
- Console logging cho development
- Error tracking middleware
- API response time monitoring

---

## 🚀 DEPLOYMENT NOTES

### Production Checklist
- [ ] Cập nhật NODE_ENV=production
- [ ] Cấu hình MongoDB Atlas
- [ ] Setup domain và SSL
- [ ] Cấu hình CORS cho production domain
- [ ] Setup file storage (Cloudinary)
- [ ] Cấu hình email service
- [ ] Setup monitoring tools

### Environment Variables for Production
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://...
CLIENT_URL=https://yourdomain.com
JWT_SECRET=strong_production_secret
```

---

## 🐛 TROUBLESHOOTING

### Common Issues
1. **MongoDB Connection Error**
   - Kiểm tra MongoDB service đang chạy
   - Verify connection string trong .env

2. **CORS Error**
   - Kiểm tra CLIENT_URL trong backend .env
   - Verify frontend đang chạy đúng port

3. **File Upload Error**
   - Kiểm tra thư mục uploads/ tồn tại
   - Verify file permissions

4. **JWT Token Error**
   - Kiểm tra JWT_SECRET trong .env
   - Clear browser localStorage/cookies

---

## 📞 SUPPORT

Nếu gặp vấn đề trong quá trình cài đặt hoặc sử dụng, vui lòng:
1. Kiểm tra logs trong console
2. Verify tất cả environment variables
3. Đảm bảo tất cả services đang chạy
4. Kiểm tra network connectivity

---

*Tài liệu này được cập nhật lần cuối: December 2024*