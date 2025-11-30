import React, { useEffect, useState } from "react";
import LayoutAdmin from "../../components/jsx/LayoutAdmin";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/orders")
      .then(res => res.json())
      .then(data => { if (data.success) setOrders(data.data); });
  }, []);

  return (
    <LayoutAdmin>
      <h2>🧾 Quản lý Đơn hàng</h2>
      <ul>
        {orders.map(o => <li key={o._id}>Mã {o._id} - {o.total}đ - {o.status}</li>)}
      </ul>
    </LayoutAdmin>
  );
};

export default AdminOrders;
