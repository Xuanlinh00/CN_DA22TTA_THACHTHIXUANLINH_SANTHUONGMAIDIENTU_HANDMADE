import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../utils/api";

const OrderDetail = () => {
  const { id } = useParams(); // lấy orderId từ URL
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/api/orders/${id}`);
        setOrder(res.data.data);
      } catch (err) {
        console.error("Lỗi lấy chi tiết đơn hàng:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return <div className="text-center py-20">Đang tải chi tiết đơn hàng...</div>;
  }

  if (!order) {
    return <div className="text-center py-20">Không tìm thấy đơn hàng.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-[#2D1E1E] mb-6">
        Chi tiết đơn hàng #{order._id}
      </h1>

      {/* Thông tin đơn hàng */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <p><span className="font-semibold">Ngày đặt:</span> {new Date(order.createdAt).toLocaleDateString("vi-VN")}</p>
        <p><span className="font-semibold">Trạng thái:</span> {order.orderStatus}</p>
        <p><span className="font-semibold">Phương thức thanh toán:</span> {order.paymentMethod}</p>
        <p><span className="font-semibold">Tổng tiền:</span> {order.totalPrice?.toLocaleString("vi-VN")} VND</p>
      </div>

      {/* Địa chỉ giao hàng */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Địa chỉ giao hàng</h2>
        <p>{order.shippingAddress.fullName}</p>
        <p>{order.shippingAddress.phone}</p>
        <p>{order.shippingAddress.address}</p>
        <p>{order.shippingAddress.city}</p>
      </div>

      {/* Sản phẩm trong đơn */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Sản phẩm</h2>
        <div className="divide-y">
          {order.orderItems.map((item) => (
            <div key={item.product} className="py-4 flex gap-4">
              <img
                src={item.image || "/assets/sample-bag.jpg"}
                alt={item.name}
                className="w-20 h-20 object-cover rounded"
              />
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">SL: {item.quantity}</p>
                <p className="text-sm text-gray-500">
                  Giá: {item.price?.toLocaleString("vi-VN")} VND
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center mt-10">
        <Link
          to="/orders"
          className="px-6 py-3 bg-[#FF6B35] text-white rounded-lg hover:bg-[#e55a2b]"
        >
          Quay lại danh sách đơn hàng
        </Link>
      </div>
    </div>
  );
};

export default OrderDetail;
