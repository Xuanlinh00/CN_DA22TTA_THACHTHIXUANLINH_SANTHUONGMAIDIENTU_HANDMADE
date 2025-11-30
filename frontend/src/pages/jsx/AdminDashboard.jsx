import React, { useEffect, useState } from "react";
import LayoutAdmin from "../../components/jsx/LayoutAdmin"; // dùng layout riêng
import "../css/AdminDashboard.css";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:5000/api/admin/users").then(res => res.json()),
      fetch("http://localhost:5000/api/admin/shops").then(res => res.json()),
      fetch("http://localhost:5000/api/admin/products").then(res => res.json()),
      fetch("http://localhost:5000/api/admin/orders").then(res => res.json())
    ])
      .then(([u, s, p, o]) => {
        if (u.success) setUsers(u.data);
        if (s.success) setShops(s.data);
        if (p.success) setProducts(p.data);
        if (o.success) setOrders(o.data);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <LayoutAdmin>
      <div className="admin-dashboard">
        <h2 className="page-title">Trang Quản Trị</h2>

        <div className="admin-section">
          <h3>Người Dùng ({users.length})</h3>
          <ul>
            {users.map((u) => <li key={u._id}>{u.name} - {u.email}</li>)}
          </ul>
        </div>

        <div className="admin-section">
          <h3>Cửa Hàng ({shops.length})</h3>
          <ul>
            {shops.map((s) => <li key={s._id}>{s.name}</li>)}
          </ul>
        </div>

        <div className="admin-section">
          <h3>Sản Phẩm ({products.length})</h3>
          <ul>
            {products.map((p) => <li key={p._id}>{p.name} - {p.price}đ</li>)}
          </ul>
        </div>

        <div className="admin-section">
          <h3>Đơn Hàng ({orders.length})</h3>
          <ul>
            {orders.map((o) => <li key={o._id}>Mã {o._id} - {o.total}đ - {o.status}</li>)}
          </ul>
        </div>
      </div>
    </LayoutAdmin>
  );
};

export default AdminDashboard;
