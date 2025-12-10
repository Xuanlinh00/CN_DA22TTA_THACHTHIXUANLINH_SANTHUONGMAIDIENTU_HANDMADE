import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../utils/api";
import toast from "react-hot-toast";
import LayoutAdmin from "../../components/jsx/LayoutAdmin";

const AdminOrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/api/orders/${id}`);
        setOrder(res.data.data);
        setStatus(res.data.data.orderStatus);
      } catch (err) {
        console.error("Lỗi lấy đơn hàng:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const updateStatus = async () => {
    try {
      await api.put(`/api/orders/${id}`, { orderStatus: status });
      toast.success("Cập nhật trạng thái thành công");
      setOrder({ ...order, orderStatus: status });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi cập nhật trạng thái");
    }
  };

  if (loading) return <LayoutAdmin><div className="text-center py-20">Đang tải đơn hàng...</div></LayoutAdmin>;
  if (!order) return <LayoutAdmin><div className="text-center py-20">Không tìm thấy đơn hàng.</div></LayoutAdmin>;

  return (
    <LayoutAdmin>
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-[#2D1E1E] mb-6">Quản lý đơn hàng #{order._id}</h1>

        {/* Thông tin đơn hàng */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <p><strong>Ngày đặt:</strong> {new Date(order.createdAt).toLocaleDateString("vi-VN")}</p>
          <p><strong>Khách hàng:</strong> {order.user?.name} ({order.user?.email})</p>
          <p><strong>Trạng thái hiện tại:</strong> {order.orderStatus}</p>
          <p><strong>Phương thức thanh toán:</strong> {order.paymentMethod}</p>
          <p><strong>Tổng tiền:</strong> {order.totalPrice?.toLocaleString("vi-VN")}₫</p>
        </div>

        {/* Cập nhật trạng thái */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Cập nhật trạng thái đơn hàng</h2>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="Đang xử lý">Đang xử lý</option>
            <option value="Đang giao">Đang giao</option>
            <option value="Hoàn thành">Hoàn thành</option>
            <option value="Đã hủy">Đã hủy</option>
          </select>
          <button
            onClick={updateStatus}
            className="ml-4 px-6 py-2 bg-[#FF6B35] text-white rounded hover:bg-[#e55a2b]"
          >
            Lưu
          </button>
        </div>

        {/* Sản phẩm trong đơn */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Sản phẩm</h2>
          {order.orderItems.map((item) => (
            <div key={item.product} className="flex gap-4 py-3 border-b last:border-0">
              <img
                src={item.image || "/assets/sample-bag.jpg"}
                alt={item.name}
                className="w-20 h-20 object-cover rounded"
              />
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">SL: {item.quantity}</p>
                <p className="text-sm text-gray-500">
                  Giá: {item.price?.toLocaleString("vi-VN")}₫
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </LayoutAdmin>
  );
};

export default AdminOrderDetail;
