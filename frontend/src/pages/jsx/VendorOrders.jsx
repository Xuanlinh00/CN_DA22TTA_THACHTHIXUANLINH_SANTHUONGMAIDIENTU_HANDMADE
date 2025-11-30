import React, { useEffect, useState } from "react";
import LayoutVendor from "../../components/jsx/LayoutVendor";

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/vendor/orders")
      .then(res => res.json())
      .then(data => { if (data.success) setOrders(data.data); });
  }, []);

  return (
    <LayoutVendor>
      <h2>🧾 Đơn hàng của tôi</h2>
      <ul>
        {orders.map(o => <li key={o._id}>Mã {o._id} - {o.total}đ - {o.status}</li>)}
      </ul>
    </LayoutVendor>
  );
};

export default VendorOrders;
