import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import LayoutAdmin from "../../components/jsx/LayoutAdmin";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Tất cả");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/api/orders");
        setOrders(res.data.data || []);
      } catch (err) {
        console.error("Lỗi lấy danh sách đơn hàng:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders =
    filter === "Tất cả"
      ? orders
      : orders.filter((o) => o.orderStatus === filter);

  if (loading) {
    return (
      <LayoutAdmin>
        <div className="text-center py-20">Đang tải danh sách đơn hàng...</div>
      </LayoutAdmin>
    );
  }

  return (
    <LayoutAdmin>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-[#2D1E1E] mb-6">
          Quản lý đơn hàng
        </h1>

        {/* Bộ lọc trạng thái */}
        <div className="mb-6 flex gap-4">
          {["Tất cả", "Đang xử lý", "Đang giao", "Hoàn thành", "Đã hủy"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg border ${
                  filter === status
                    ? "bg-[#FF6B35] text-white"
                    : "bg-white text-gray-600 hover:bg-[#FFFCFA]"
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>

        {/* Bảng đơn hàng */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full border-collapse">
            <thead className="bg-[#FF6B35] text-white">
              <tr>
                <th className="px-4 py-3 text-left">Mã đơn</th>
                <th className="px-4 py-3 text-left">Khách hàng</th>
                <th className="px-4 py-3 text-left">Ngày đặt</th>
                <th className="px-4 py-3 text-left">Tổng tiền</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => (
                <tr key={o._id} className="border-b hover:bg-[#FFFCFA]">
                  <td className="px-4 py-3">{o._id}</td>
                  <td className="px-4 py-3">
                    {o.user?.name} <br />
                    <span className="text-sm text-gray-500">
                      {o.user?.email}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {new Date(o.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-4 py-3">
                    {o.totalPrice?.toLocaleString("vi-VN")}₫
                  </td>
                  <td className="px-4 py-3">{o.orderStatus}</td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/admin/orders/${o._id}`}
                      className="text-[#FF6B35] hover:underline"
                    >
                      Chi tiết
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-500">
                    Không có đơn hàng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </LayoutAdmin>
  );
};

export default AdminOrders;
