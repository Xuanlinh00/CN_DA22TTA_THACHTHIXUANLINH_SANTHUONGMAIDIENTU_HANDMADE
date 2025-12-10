import { useContext, useState } from "react";
import useCart from "@/hooks/useCart";
import api from "@/utils/api";
import { AuthContext } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function Checkout() {
  const { cart } = useCart();
  const { user } = useContext(AuthContext);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || "",
    address: "",
    phone: "",
    city: "",
    districtId: 0,
    wardCode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);

  // ✅ Validation form
  const validateForm = () => {
    if (!shippingAddress.fullName.trim()) return "Vui lòng nhập họ tên";
    if (!shippingAddress.phone.trim()) return "Vui lòng nhập số điện thoại";
    if (!/^(0[0-9]{9})$/.test(shippingAddress.phone))
      return "Số điện thoại không hợp lệ";
    if (!shippingAddress.address.trim()) return "Vui lòng nhập địa chỉ";
    if (!shippingAddress.city.trim()) return "Vui lòng nhập tỉnh/thành phố";
    return null;
  };

  const createOrder = async () => {
    if (!user) return toast.error("Vui lòng đăng nhập");
    if (!cart.items?.length) return toast.error("Giỏ hàng trống");

    const errorMsg = validateForm();
    if (errorMsg) return toast.error(errorMsg);

    setLoading(true);
    try {
      const orderItems = cart.items.map((i) => ({
        product: i.product._id || i.product,
        shop: i.shop?._id || i.shop,
        name: i.product?.name,
        quantity: i.quantity,
        price: i.price,
        image: i.product?.images?.[0] || "",
      }));

      const payload = {
        orderItems,
        shippingAddress,
        paymentMethod,
        totalPrice: cart.totalPrice,
        shippingFee: 0,
      };

      const res = await api.post("/api/orders", payload);
      const order = res?.data?.data;
      toast.success("Tạo đơn hàng thành công");

      if (paymentMethod === "VNPAY") {
        const pay = await api.post("/api/payment/create-payment", {
          orderId: order._id,
          amount: order.totalPrice,
        });
        const url = pay?.data?.paymentUrl;
        if (url) window.location.href = url;
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Lỗi tạo đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#2D1E1E] mb-6">Thanh toán</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form địa chỉ + phương thức thanh toán */}
        <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-4">Địa chỉ giao hàng</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="border rounded px-3 py-2"
              placeholder="Họ tên"
              value={shippingAddress.fullName}
              onChange={(e) =>
                setShippingAddress((s) => ({ ...s, fullName: e.target.value }))
              }
            />
            <input
              className="border rounded px-3 py-2"
              placeholder="Điện thoại"
              value={shippingAddress.phone}
              onChange={(e) =>
                setShippingAddress((s) => ({ ...s, phone: e.target.value }))
              }
            />
            <input
              className="border rounded px-3 py-2 md:col-span-2"
              placeholder="Địa chỉ"
              value={shippingAddress.address}
              onChange={(e) =>
                setShippingAddress((s) => ({ ...s, address: e.target.value }))
              }
            />
            <input
              className="border rounded px-3 py-2"
              placeholder="Tỉnh/Thành phố"
              value={shippingAddress.city}
              onChange={(e) =>
                setShippingAddress((s) => ({ ...s, city: e.target.value }))
              }
            />
            <input
              className="border rounded px-3 py-2"
              placeholder="District ID"
              value={shippingAddress.districtId}
              onChange={(e) =>
                setShippingAddress((s) => ({
                  ...s,
                  districtId: Number(e.target.value),
                }))
              }
            />
            <input
              className="border rounded px-3 py-2"
              placeholder="Ward Code"
              value={shippingAddress.wardCode}
              onChange={(e) =>
                setShippingAddress((s) => ({ ...s, wardCode: e.target.value }))
              }
            />
          </div>

          <h2 className="font-semibold mt-6 mb-3">Phương thức thanh toán</h2>
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="pm"
                checked={paymentMethod === "COD"}
                onChange={() => setPaymentMethod("COD")}
              />
              <span>COD</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="pm"
                checked={paymentMethod === "VNPAY"}
                onChange={() => setPaymentMethod("VNPAY")}
              />
              <span>VNPAY</span>
            </label>
          </div>

          {/* Hiển thị sản phẩm trong giỏ */}
          <h2 className="font-semibold mt-6 mb-3">Sản phẩm trong giỏ</h2>
          <div className="divide-y">
            {cart.items.map((item) => (
              <div key={item.product._id || item.product} className="py-3 flex gap-4">
                <img
                  src={item.product?.images?.[0] || "/assets/sample-bag.jpg"}
                  alt={item.product?.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="font-medium">{item.product?.name}</p>
                  <p className="text-sm text-gray-500">SL: {item.quantity}</p>
                  <p className="text-sm text-gray-500">
                    Giá: {item.price?.toLocaleString("vi-VN")} VND
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tổng tiền + nút đặt hàng */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <span>Tạm tính</span>
            <span>{cart.totalPrice?.toLocaleString("vi-VN")} VND</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span>Phí vận chuyển</span>
            <span>0 VND</span>
          </div>
          <div className="flex items-center justify-between mt-2 font-semibold text-[#FF6B35]">
            <span>Tổng cộng</span>
            <span>{cart.totalPrice?.toLocaleString("vi-VN")} VND</span>
          </div>
          <button
            disabled={loading}
            onClick={createOrder}
            className="mt-6 w-full px-6 py-3 bg-[#FF6B35] text-white rounded-lg font-semibold hover:bg-[#e55a2b] disabled:opacity-50"
          >
            {loading ? "Đang xử lý..." : "Đặt hàng"}
          </button>
        </div>
      </div>
    </div>
  );
}
