import useCart from "@/hooks/useCart";
import { Link, useNavigate } from "react-router-dom";

export default function CartPage() {
  const { cart, loading, removeFromCart } = useCart();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-4 border-[#FF6B35]"></div>
        <p className="mt-4 text-gray-600">Đang tải giỏ hàng...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#2D1E1E] mb-6">🛍 Giỏ hàng</h1>

      {!cart.items || cart.items.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-600">Giỏ hàng trống.</p>
          <Link
            to="/products"
            className="mt-4 inline-block bg-[#FF6B35] text-white px-6 py-2 rounded hover:bg-[#e55a2b]"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Danh sách sản phẩm */}
          <div className="md:col-span-2 bg-white rounded-lg shadow">
            {cart.items.map((item) => (
              <div
                key={item.product}
                className="flex items-center gap-4 p-4 border-b last:border-0"
              >
                <img
                  src={item?.product?.images?.[0] || "/assets/sample-bag.jpg"}
                  alt={item?.product?.name || "Sản phẩm"}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="font-medium text-[#2D1E1E]">
                    {item?.product?.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Số lượng: {item.quantity}
                  </p>
                  <p className="text-sm text-gray-500">
                    Thành tiền:{" "}
                    {item.subtotal
                      ? item.subtotal.toLocaleString("vi-VN")
                      : 0}{" "}
                    VND
                  </p>
                </div>
                <button
                  className="text-sm px-3 py-1 border border-[#FF6B35] text-[#FF6B35] rounded hover:bg-[#FF6B35] hover:text-white transition"
                  onClick={() => removeFromCart(item.product.toString())}
                >
                  Xoá
                </button>
              </div>
            ))}
          </div>

          {/* Tổng tiền + Checkout */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between text-lg">
              <span>Tổng cộng</span>
              <span className="font-bold text-[#FF6B35]">
                {cart.totalPrice
                  ? cart.totalPrice.toLocaleString("vi-VN")
                  : 0}{" "}
                VND
              </span>
            </div>
            <button
              className="mt-6 w-full px-6 py-3 bg-[#FF6B35] text-white rounded-lg font-semibold hover:bg-[#e55a2b] transition"
              onClick={() => navigate("/checkout")}
            >
              Tiến hành đặt hàng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
