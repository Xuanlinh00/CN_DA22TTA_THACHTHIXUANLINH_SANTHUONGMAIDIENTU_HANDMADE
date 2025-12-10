// src/pages/jsx/VendorDashboard.jsx
import React from "react";
import { Link } from "react-router-dom";

const VendorDashboard = () => {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-[#2D1E1E]">Chào mừng quay lại, Nghệ nhân!</h1>
      <p className="text-xl text-gray-700 mt-2">Xưởng Linh Handmade</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
        <div className="bg-white p-8 rounded-2xl shadow text-center">
          <p className="text-4xl font-bold text-[#FF6B35]">24</p>
          <p className="mt-2 text-gray-700">Đơn hàng mới</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow text-center">
          <p className="text-4xl font-bold text-[#FF6B35]">156</p>
          <p className="mt-2 text-gray-700">Sản phẩm đang bán</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow text-center">
          <p className="text-4xl font-bold text-[#FF6B35]">8.2M</p>
          <p className="mt-2 text-gray-700">Doanh thu tháng</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow text-center">
          <p className="text-4xl font-bold text-[#FF6B35]">4.9 ★</p>
          <p className="mt-2 text-gray-700">Đánh giá cửa hàng</p>
        </div>
      </div>

      <div className="mt-12 flex gap-6">
        <Link to="/vendor/add-product" className="bg-[#FF6B35] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#e55a2b] shadow-lg">
          + Thêm sản phẩm mới
        </Link>
        <Link to="/vendor/orders" className="border-2 border-[#FF6B35] text-[#FF6B35] px-8 py-4 rounded-xl font-bold hover:bg-[#FF6B35] hover:text-white">
          Xem đơn hàng
        </Link>
      </div>
    </div>
  );
};

export default VendorDashboard;