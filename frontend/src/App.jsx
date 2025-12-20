import { Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import OrderNotifications from './components/order/OrderNotifications';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import TrackOrder from './pages/TrackOrder';
import Profile from './pages/Profile';

import PaymentResult from './pages/PaymentResult';
import Shops from './pages/Shops';
import ShopDetail from './pages/ShopDetail';

// Shop Owner Pages
import ShopDashboard from './pages/shop/ShopDashboard';
import ShopProducts from './pages/shop/ShopProducts';
import ShopOrders from './pages/shop/ShopOrders';
import ShopSettings from './pages/shop/ShopSettings';
import CreateShop from './pages/shop/CreateShop';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminShops from './pages/admin/AdminShops';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCategories from './pages/admin/AdminCategories';



function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <OrderNotifications />
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/shops" element={<Shops />} />
          <Route path="/shops/:id" element={<ShopDetail />} />
          <Route path="/track-order" element={<TrackOrder />} />

          <Route path="/payment/result" element={<PaymentResult />} />

          {/* Protected Routes - User */}
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Shop Owner Routes */}
          <Route
            path="/create-shop"
            element={
              <ProtectedRoute allowedRoles={['user', 'shop_owner']}>
                <CreateShop />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shop-dashboard"
            element={
              <ProtectedRoute allowedRoles={['shop_owner']}>
                <ShopDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shop-dashboard/products"
            element={
              <ProtectedRoute allowedRoles={['shop_owner']}>
                <ShopProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shop-dashboard/orders"
            element={
              <ProtectedRoute allowedRoles={['shop_owner']}>
                <ShopOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shop-dashboard/settings"
            element={
              <ProtectedRoute allowedRoles={['shop_owner']}>
                <ShopSettings />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/shops"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminShops />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminCategories />
              </ProtectedRoute>
            }
          />



          {/* 404 */}
          <Route path="*" element={<div className="container mx-auto px-4 py-20 text-center">
            <h1 className="text-4xl font-bold text-primary-900 mb-4">404 - Không tìm thấy trang</h1>
            <a href="/" className="text-primary-700 hover:text-primary-900">Về trang chủ</a>
          </div>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
