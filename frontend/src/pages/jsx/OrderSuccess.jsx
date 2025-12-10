import React from "react";
import { Link, useLocation } from "react-router-dom";

const OrderSuccess = () => {
  const location = useLocation();
  // Nếu bạn redirect từ Checkout, có thể truyền orderId qua state
  const orderId = location.state?.orderId;

  return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <div className="bg-white rounded-xl shadow-lg p-10">
        <div className="text-6xl mb-6">✅</div>
        <h1 className="text-3xl font-bold text-[#2D1E1E] mb-4">
          Đặt hàng thành công!
        </h1>
        <p className="text-gray-600 mb-6">
          Cảm ơn bạn đã mua sắm tại <span className="font-semibold">Craftify Handmade</span>.
        </p>

        {orderId && (
          <p className="text-lg mb-6">
            Mã đơn hàng của bạn:{" "}
            <span className="font-bold text-[#FF6B35]">{orderId}</span>
          </p>
        )}

        <div className="flex justify-center gap-6 mt-8">
          <Link
            to="/orders"
            className="px-6 py-3 bg-[#FF6B35] text-white rounded-lg hover:bg-[#e55a2b]"
          >
            Xem đơn hàng
          </Link>
          <Link
            to="/products"
            className="px-6 py-3 border border-[#FF6B35] text-[#FF6B35] rounded-lg hover:bg-[#FF6B35] hover:text-white"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
