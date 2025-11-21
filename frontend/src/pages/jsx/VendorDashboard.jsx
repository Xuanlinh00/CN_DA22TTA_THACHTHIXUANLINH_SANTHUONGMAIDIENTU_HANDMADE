import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/VendorDashboard.css';

const VendorDashboard = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Gọi API lấy sản phẩm của vendor
    axios.get('/api/vendor/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));

    // Gọi API lấy đơn hàng liên quan đến shop
    axios.get('/api/vendor/orders')
      .then(res => setOrders(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="vendor-dashboard-container">
      <h1 className="dashboard-title">Bảng điều khiển của Shop</h1>

      <section className="dashboard-section">
        <h2 className="section-title">Sản phẩm của tôi</h2>
        {products.length === 0 ? (
          <p className="empty-msg">Chưa có sản phẩm nào</p>
        ) : (
          <div className="dashboard-grid">
            {products.map(product => (
              <div key={product._id} className="dashboard-card">
                <img src={product.image} alt={product.name} className="dashboard-img" />
                <h3>{product.name}</h3>
                <p>{product.price} VND</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="dashboard-section">
        <h2 className="section-title">Đơn hàng của shop</h2>
        {orders.length === 0 ? (
          <p className="empty-msg">Chưa có đơn hàng nào</p>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order._id} className="order-card">
                <h3>Mã đơn: {order._id}</h3>
                <p>Trạng thái: {order.orderStatus}</p>
                <p>Tổng tiền: {order.totalPrice} VND</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default VendorDashboard;
