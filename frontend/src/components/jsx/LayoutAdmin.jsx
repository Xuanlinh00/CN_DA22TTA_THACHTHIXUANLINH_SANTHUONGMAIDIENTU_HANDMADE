import React from "react";
import { Link, Outlet } from "react-router-dom";

const LayoutAdmin = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-[#2D1E1E] text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-gray-700">
          Admin Panel
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin/dashboard" className="block px-3 py-2 rounded hover:bg-[#FF6B35]">📊 Dashboard</Link>
          <Link to="/admin/orders" className="block px-3 py-2 rounded hover:bg-[#FF6B35]">📦 Orders</Link>
          <Link to="/admin/products" className="block px-3 py-2 rounded hover:bg-[#FF6B35]">🛍 Products</Link>
          <Link to="/admin/users" className="block px-3 py-2 rounded hover:bg-[#FF6B35]">👤 Users</Link>
          <Link to="/admin/shops" className="block px-3 py-2 rounded hover:bg-[#FF6B35]">🏪 Shops</Link>
          <Link to="/admin/reviews" className="block px-3 py-2 rounded hover:bg-[#FF6B35]">⭐ Reviews</Link>
          <Link to="/admin/categories" className="block px-3 py-2 rounded hover:bg-[#FF6B35]">📂 Categories</Link>
          <Link to="/admin/coupons" className="block px-3 py-2 rounded hover:bg-[#FF6B35]">🎟 Coupons</Link>
          <Link to="/admin/banners" className="block px-3 py-2 rounded hover:bg-[#FF6B35]">🖼 Banners</Link>
        </nav>
      </aside>

      {/* Nội dung */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default LayoutAdmin;
