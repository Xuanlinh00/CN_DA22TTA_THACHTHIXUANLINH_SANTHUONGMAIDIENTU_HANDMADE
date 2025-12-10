import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import LayoutAdmin from "../../components/jsx/LayoutAdmin";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    orders: 0,
    revenue: 0,
    users: 0,
    products: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/api/admin/stats");
        setStats(res.data.data || {});
      } catch (err) {
        console.error("Lỗi lấy thống kê:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <LayoutAdmin>
        <div className="text-center py-20">Đang tải thống kê...</div>
      </LayoutAdmin>
    );
  }

  return (
    <LayoutAdmin>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-[#2D1E1E] mb-8">
          Bảng điều khiển Admin
        </h1>

        {/* Cards thống kê */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-3xl font-bold text-[#FF6B35]">{stats.orders}</p>
            <p className="text-gray-600">Đơn hàng</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-3xl font-bold text-[#FF6B35]">
              {stats.revenue?.toLocaleString("vi-VN")}₫
            </p>
            <p className="text-gray-600">Doanh thu</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-3xl font-bold text-[#FF6B35]">{stats.users}</p>
            <p className="text-gray-600">Người dùng</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-3xl font-bold text-[#FF6B35]">{stats.products}</p>
            <p className="text-gray-600">Sản phẩm</p>
          </div>
        </div>

        {/* Bảng đơn hàng gần đây */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Đơn hàng gần đây</h2>
          {stats.recentOrders?.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="bg-[#FF6B35] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">Mã đơn</th>
                    <th className="px-4 py-3 text-left">Khách hàng</th>
                    <th className="px-4 py-3 text-left">Ngày đặt</th>
                    <th className="px-4 py-3 text-left">Tổng tiền</th>
                    <th className="px-4 py-3 text-left">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((o) => (
                    <tr key={o._id} className="border-b hover:bg-[#FFFCFA]">
                      <td className="px-4 py-3">{o._id}</td>
                      <td className="px-4 py-3">{o.user?.name}</td>
                      <td className="px-4 py-3">
                        {new Date(o.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-4 py-3">
                        {o.totalPrice?.toLocaleString("vi-VN")}₫
                      </td>
                      <td className="px-4 py-3">{o.orderStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600">Chưa có đơn hàng nào gần đây.</p>
          )}
        </div>
      </div>
    </LayoutAdmin>
  );
};

export default AdminDashboard;
