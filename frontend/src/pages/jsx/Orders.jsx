import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Gọi API lấy đơn hàng của user
    axios.get('/api/orders/myorders')
      .then(res => setOrders(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="orders-container">
      <h1 className="orders-title">Đơn hàng của tôi</h1>
      {orders.length === 0 ? (
        <p className="empty-orders">Bạn chưa có đơn hàng nào</p>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order._id} className="order-card">
              <h3 className="order-id">Mã đơn: {order._id}</h3>
              <p className="order-status">Trạng thái: {order.orderStatus}</p>
              <p className="order-total">Tổng tiền: {order.totalPrice} VND</p>
              <div className="order-items">
                {order.orderItems.map(item => (
                  <div key={item._id} className="order-item">
                    <span>{item.product.name}</span>
                    <span>x{item.quantity}</span>
                    <span>{item.price} VND</span>
                  </div>
                ))}
              </div>
              <p className="order-date">Ngày đặt: {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
