import React, { useEffect, useState } from "react";
import LayoutVendor from "../../components/jsx/LayoutVendor";

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/vendor/orders`, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data.success) setOrders(data.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <LayoutVendor>
      <h2 className="text-2xl font-bold mb-4">🧾 Đơn hàng của tôi</h2>
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <ul className="space-y-2">
          {orders.map(o => (
            <li key={o._id} className="p-3 border rounded">
              Mã {o._id} – {o.total.toLocaleString()}đ – {o.status}
            </li>
          ))}
        </ul>
      )}
    </LayoutVendor>
  );
};

export default VendorOrders;
