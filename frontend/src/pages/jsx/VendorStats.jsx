import React, { useEffect, useState } from "react";
import LayoutVendor from "../../components/jsx/LayoutVendor";

const VendorStats = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0,
    rating: 0,
  });

  useEffect(() => {
    // Gọi API lấy thống kê
    fetch(`${import.meta.env.VITE_API_URL}/api/vendor/stats`, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data.success) setStats(data.data);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <LayoutVendor>
      <h1 className="text-3xl font-bold text-[#2D1E1E] mb-8">📊 Thống kê kinh doanh</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow text-center">
          <p className="text-4xl font-bold text-[#FF6B35]">{stats.totalProducts}</p>
          <p className="mt-2 text-gray-700">Sản phẩm đang bán</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow text-center">
          <p className="text-4xl font-bold text-[#FF6B35]">{stats.totalOrders}</p>
          <p className="mt-2 text-gray-700">Tổng đơn hàng</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow text-center">
          <p className="text-4xl font-bold text-[#FF6B35]">
            {stats.revenue.toLocaleString()}đ
          </p>
          <p className="mt-2 text-gray-700">Doanh thu tháng</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow text-center">
          <p className="text-4xl font-bold text-[#FF6B35]">{stats.rating} ★</p>
          <p className="mt-2 text-gray-700">Đánh giá trung bình</p>
        </div>
      </div>
    </LayoutVendor>
  );
};

export default VendorStats;
