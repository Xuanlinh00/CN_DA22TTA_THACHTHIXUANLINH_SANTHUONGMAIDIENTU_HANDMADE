import React from "react";
import { Link } from "react-router-dom";

// Utils
import PrivateRoute from "./utils/PrivateRoute";
import PublicRoute from "./utils/PublicRoute";

// Layouts
import AutoLayout from "./components/jsx/AutoLayout";
import LayoutAdmin from "./components/jsx/LayoutAdmin";
import LayoutVendor from "./components/jsx/LayoutVendor";

// Public Pages
import Home from "./pages/jsx/Home.jsx";
import ProductDetail from "./pages/jsx/ProductDetail.jsx";
import CartPage from "./pages/jsx/CartPage.jsx";
import Checkout from "./pages/jsx/Checkout.jsx";
import Orders from "./pages/jsx/Orders.jsx";
import Profile from "./pages/jsx/Profile.jsx";
import Wishlist from "./pages/jsx/Wishlist.jsx";
import Contact from "./pages/jsx/Contact.jsx";
import Policy from "./pages/jsx/Policy.jsx";
import Shops from "./pages/jsx/Shops.jsx";
import ShopDetail from "./pages/jsx/ShopDetail.jsx";
import Category from "./pages/jsx/Category.jsx";
import About from "./pages/jsx/About.jsx";

// Admin Pages
import AdminDashboard from "./pages/jsx/AdminDashboard.jsx";
import AdminUsers from "./pages/jsx/AdminUsers.jsx";
import AdminShops from "./pages/jsx/AdminShops.jsx";
import AdminProducts from "./pages/jsx/AdminProducts.jsx";
import AdminOrders from "./pages/jsx/AdminOrders.jsx";

// Vendor Pages
import VendorDashboard from "./pages/jsx/VendorDashboard.jsx";
import AddProduct from "./pages/jsx/AddProduct.jsx";
import EditProduct from "./pages/jsx/EditProduct.jsx";
import VendorProducts from "./pages/jsx/VendorProducts.jsx";
import VendorOrders from "./pages/jsx/VendorOrders.jsx";
import VendorStats from "./pages/jsx/VendorStats.jsx";

// Auth Pages
import Login from "./pages/jsx/Login.jsx";
import Register from "./pages/jsx/Register.jsx";

const routes = [
  // Public
  { path: "/", element: <AutoLayout><Home /></AutoLayout> },
  { path: "/categories", element: <AutoLayout><Category /></AutoLayout> },
  { path: "/about", element: <AutoLayout><About /></AutoLayout> },
  { path: "/shops", element: <AutoLayout><Shops /></AutoLayout> },
  { path: "/shop/:id", element: <AutoLayout><ShopDetail /></AutoLayout> },
  { path: "/product/:id", element: <AutoLayout><ProductDetail /></AutoLayout> },
  { path: "/cart", element: <AutoLayout><CartPage /></AutoLayout> },
  { path: "/checkout", element: <AutoLayout><Checkout /></AutoLayout> },
  { path: "/orders", element: <AutoLayout><Orders /></AutoLayout> },
  { path: "/profile", element: <AutoLayout><Profile /></AutoLayout> },
  { path: "/wishlist", element: <AutoLayout><Wishlist /></AutoLayout> },
  { path: "/contact", element: <AutoLayout><Contact /></AutoLayout> },
  { path: "/policy", element: <AutoLayout><Policy /></AutoLayout> },

  // Auth
  { path: "/login", element: <PublicRoute><Login /></PublicRoute> },
  { path: "/register", element: <PublicRoute><Register /></PublicRoute> },

  // Admin (nested)
  {
    path: "/admin",
    element: (
      <PrivateRoute role="admin">
        <LayoutAdmin />
      </PrivateRoute>
    ),
    children: [
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "users", element: <AdminUsers /> },
      { path: "shops", element: <AdminShops /> },
      { path: "products", element: <AdminProducts /> },
      { path: "orders", element: <AdminOrders /> },
    ],
  },

  // Vendor (nested)
  {
    path: "/vendor",
    element: (
      <PrivateRoute role="vendor">
        <LayoutVendor />
      </PrivateRoute>
    ),
    children: [
      { path: "dashboard", element: <VendorDashboard /> },
      { path: "add-product", element: <AddProduct /> },
      { path: "edit-product/:id", element: <EditProduct /> },
      { path: "products", element: <VendorProducts /> },
      { path: "orders", element: <VendorOrders /> },
      { path: "stats", element: <VendorStats /> },
    ],
  },

  // 404
  {
    path: "*",
    element: (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFCFA]">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-[#FF853F]">404</h1>
          <p className="text-3xl mt-6 text-[#2D1E1E]">Oops! Trang không tồn tại</p>
          <Link to="/" className="mt-10 inline-block btn-cam text-xl">
            Về trang chủ
          </Link>
        </div>
      </div>
    ),
  },
];

export default routes;
