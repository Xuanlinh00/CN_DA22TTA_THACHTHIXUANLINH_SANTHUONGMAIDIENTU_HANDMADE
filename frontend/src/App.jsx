import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./utils/PrivateRoute";

import Layout from "./components/jsx/Layout";
import LayoutAdmin from "./components/jsx/LayoutAdmin";
import LayoutVendor from "./components/jsx/LayoutVendor";

// Trang người dùng
import Home from "./pages/jsx/Home";
import Login from "./pages/jsx/Login";
import Register from "./pages/jsx/Register";
import ProductList from "./pages/jsx/ProductList";
import ProductDetail from "./pages/jsx/ProductDetail";
import CartPage from "./pages/jsx/CartPage";
import Checkout from "./pages/jsx/Checkout";
import Orders from "./pages/jsx/Orders";
import Profile from "./pages/jsx/Profile";
import Wishlist from "./pages/jsx/Wishlist";
import Contact from "./pages/jsx/Contact";
import Policy from "./pages/jsx/Policy";

// Trang admin
import AdminDashboard from "./pages/jsx/AdminDashboard";
import AdminUsers from "./pages/jsx/AdminUsers";
import AdminShops from "./pages/jsx/AdminShops";
import AdminProducts from "./pages/jsx/AdminProducts";
import AdminOrders from "./pages/jsx/AdminOrders";

// Trang vendor
import VendorDashboard from "./pages/jsx/VendorDashboard";
import VendorProducts from "./pages/jsx/VendorProducts";
import VendorOrders from "./pages/jsx/VendorOrders";
import VendorStats from "./pages/jsx/VendorStats";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Người dùng */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/register" element={<Layout><Register /></Layout>} />
        <Route path="/products" element={<Layout><ProductList /></Layout>} />
        <Route path="/product/:id" element={<Layout><ProductDetail /></Layout>} />
        <Route path="/cart" element={<Layout><CartPage /></Layout>} />
        <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
        <Route path="/orders" element={<Layout><Orders /></Layout>} />
        <Route path="/profile" element={<Layout><Profile /></Layout>} />
        <Route path="/wishlist" element={<Layout><Wishlist /></Layout>} />
        <Route path="/contact" element={<Layout><Contact /></Layout>} />
        <Route path="/policy" element={<Layout><Policy /></Layout>} />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <PrivateRoute role="admin">
              <LayoutAdmin><AdminDashboard /></LayoutAdmin>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <PrivateRoute role="admin">
              <LayoutAdmin><AdminUsers /></LayoutAdmin>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/shops"
          element={
            <PrivateRoute role="admin">
              <LayoutAdmin><AdminShops /></LayoutAdmin>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <PrivateRoute role="admin">
              <LayoutAdmin><AdminProducts /></LayoutAdmin>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <PrivateRoute role="admin">
              <LayoutAdmin><AdminOrders /></LayoutAdmin>
            </PrivateRoute>
          }
        />

        {/* Vendor */}
        <Route
          path="/vendor"
          element={
            <PrivateRoute role="vendor">
              <LayoutVendor><VendorDashboard /></LayoutVendor>
            </PrivateRoute>
          }
        />
        <Route
          path="/vendor/products"
          element={
            <PrivateRoute role="vendor">
              <LayoutVendor><VendorProducts /></LayoutVendor>
            </PrivateRoute>
          }
        />
        <Route
          path="/vendor/orders"
          element={
            <PrivateRoute role="vendor">
              <LayoutVendor><VendorOrders /></LayoutVendor>
            </PrivateRoute>
          }
        />
        <Route
          path="/vendor/stats"
          element={
            <PrivateRoute role="vendor">
              <LayoutVendor><VendorStats /></LayoutVendor>
            </PrivateRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
