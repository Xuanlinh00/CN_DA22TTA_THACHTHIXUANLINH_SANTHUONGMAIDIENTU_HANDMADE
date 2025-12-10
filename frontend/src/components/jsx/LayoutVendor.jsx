import React from "react";
import Navbar from "./Navbar";

const LayoutVendor = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex flex-1">
        {/* Sidebar vendor */}
        <aside className="w-64 bg-[#FF853F] text-white p-6">
          <h2 className="text-xl font-bold mb-6">Vendor Panel</h2>
          <ul className="space-y-3">
            <li><a href="/vendor" className="hover:underline">Dashboard</a></li>
            <li><a href="/vendor/products" className="hover:underline">Products</a></li>
            <li><a href="/vendor/add-product" className="hover:underline">Add Product</a></li>
            <li><a href="/vendor/orders" className="hover:underline">Orders</a></li>
            <li><a href="/vendor/stats" className="hover:underline">Statistics</a></li>
          </ul>
        </aside>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
};

export default LayoutVendor;
