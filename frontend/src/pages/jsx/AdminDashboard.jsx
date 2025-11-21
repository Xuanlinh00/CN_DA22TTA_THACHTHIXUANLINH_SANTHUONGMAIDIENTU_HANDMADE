import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/AdminDashboard.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Gọi API lấy dữ liệu quản lý
    axios.get('/api/admin/users')
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));

    axios.get('/api/admin/shops')
      .then(res => setShops(res.data))
      .catch(err => console.error(err));

    axios.get('/api/admin/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));

    axios.get('/api/admin/orders')
      .then(res => setOrders(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="admin-dashboard-container">
      <h1 className="dashboard-title">Bảng điều khiển Admin</h1>

      <section className="dashboard-section">
        <h2 className="section-title">Người dùng ({users.length})</h2>
        <div className="dashboard-list">
          {users.map(user => (
            <div key={user._id} className="dashboard-card">
              <h3>{user.name}</h3>
              <p>Email: {user.email}</p>
              <p>Vai trò: {user.role}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="section-title">Gian hàng ({shops.length})</h2>
        <div className="dashboard-list">
          {shops.map(shop => (
            <div key={shop._id} className="dashboard-card">
              <h3>{shop.shopName}</h3>
              <p>Chủ shop: {shop.user?.name}</p>
              <p>Trạng thái: {shop.status}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="section-title">Sản phẩm ({products.length})</h2>
        <div className="dashboard-list">
          {products.map(product => (
            <div key={product._id} className="dashboard-card">
              <h3>{product.name}</h3>
              <p>Giá: {product.price} VND</p>
              <p>Shop: {product.shop?.shopName}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="section-title">Đơn hàng ({orders.length})</h2>
        <div className="dashboard-list">
          {orders.map(order => (
            <div key={order._id} className="dashboard-card">
              <h3>Mã đơn: {order._id}</h3>
              <p>Khách hàng: {order.customer?.name}</p>
              <p>Trạng thái: {order.orderStatus}</p>
              <p>Tổng tiền: {order.totalPrice} VND</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
