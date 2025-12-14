# Craftify Handmade - Frontend

Frontend React cho nền tảng thương mại điện tử handmade.

## Công nghệ sử dụng

- **React 18** - UI Library
- **Vite** - Build tool
- **React Router v6** - Routing
- **TailwindCSS** - Styling
- **React Query** - Data fetching & caching
- **Zustand** - State management
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **React Icons** - Icons
- **React Hot Toast** - Notifications

## Cài đặt

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build production
npm run build

# Preview production build
npm run preview
```

## Cấu trúc thư mục

```
src/
├── components/       # Reusable components
│   └── common/      # Common components (Navbar, Footer, etc.)
├── pages/           # Page components
│   ├── auth/        # Authentication pages
│   ├── admin/       # Admin dashboard pages
│   └── shop/        # Shop owner pages
├── services/        # API services
├── stores/          # Zustand stores
├── utils/           # Utility functions
├── App.jsx          # Main app component
└── main.jsx         # Entry point
```

## Tính năng

### Khách hàng
- Đăng ký / Đăng nhập
- Xem sản phẩm handmade
- Tìm kiếm & lọc sản phẩm
- Thêm vào giỏ hàng
- Đặt hàng
- Theo dõi đơn hàng
- Quản lý tài khoản

### Chủ shop
- Đăng ký cửa hàng
- Quản lý sản phẩm (CRUD)
- Quản lý đơn hàng
- Xem thống kê doanh thu
- Cập nhật thông tin shop

### Admin
- Quản lý người dùng
- Duyệt/từ chối cửa hàng
- Quản lý sản phẩm
- Quản lý đơn hàng
- Quản lý danh mục
- Xem thống kê tổng quan

## Environment Variables

Tạo file `.env` với nội dung:

```
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=Craftify Handmade
```

## Theme

Hệ thống sử dụng theme màu nâu handmade với:
- Primary: Các tông màu nâu (#43302b - #fdf8f6)
- Accent: Các tông màu vàng cam (#e89005 - #fef3e2)
- Font chính: Inter
- Font tiêu đề: Playfair Display

## API Integration

Tất cả API calls được xử lý thông qua:
- `src/utils/axios.js` - Axios instance với interceptors
- `src/services/*.js` - Service functions cho từng module

## State Management

- **Auth State**: Zustand store (`src/stores/authStore.js`)
- **Cart State**: Zustand store (`src/stores/cartStore.js`)
- **Server State**: React Query

## Routing

Protected routes được implement với `ProtectedRoute` component:
- User routes: Yêu cầu đăng nhập
- Shop owner routes: Yêu cầu role `shop_owner`
- Admin routes: Yêu cầu role `admin`
