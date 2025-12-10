import React, { useEffect, useState } from "react";
import AutoLayout from "../../components/jsx/AutoLayout";
import api from "../../utils/api";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/api/orders/myorders");
        setOrders(res.data.data || []);
      } catch (err) {
        console.error("Lỗi lấy đơn hàng:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <AutoLayout>
        <div className="text-center py-20">Đang tải đơn hàng...</div>
      </AutoLayout>
    );
  }

  return (
    <AutoLayout>
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-[#2D1E1E] mb-6">📦 Đơn Hàng Của Tôi</h2>
        {orders.length === 0 ? (
          <p className="text-gray-600">Bạn chưa có đơn hàng nào.</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full border-collapse">
              <thead className="bg-[#FF6B35] text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Mã đơn</th>
                  <th className="px-4 py-3 text-left">Ngày đặt</th>
                  <th className="px-4 py-3 text-left">Tổng tiền</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id} className="border-b hover:bg-[#FFFCFA]">
                    <td className="px-4 py-3">{o._id}</td>
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
        )}
      </section>
    </AutoLayout>
  );
};

export default Orders;
