import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/Cart.css';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);

  // Giả sử API backend có endpoint /api/cart
  useEffect(() => {
    axios.get('/api/cart')
      .then(res => setCartItems(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleRemove = (id) => {
    setCartItems(cartItems.filter(item => item._id !== id));
    // Có thể gọi API DELETE /api/cart/:id để xóa trên server
  };

  const handleQuantityChange = (id, qty) => {
    setCartItems(cartItems.map(item =>
      item._id === id ? { ...item, quantity: qty } : item
    ));
    // Có thể gọi API PUT /api/cart/:id để cập nhật số lượng
  };

  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="cart-container">
      <h1 className="cart-title">Giỏ hàng của bạn</h1>
      {cartItems.length === 0 ? (
        <p className="empty-cart">Giỏ hàng trống</p>
      ) : (
        <div className="cart-items">
          {cartItems.map(item => (
            <div key={item._id} className="cart-item">
              <img src={item.image} alt={item.name} className="cart-img" />
              <div className="cart-info">
                <h3>{item.name}</h3>
                <p>{item.price} VND</p>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item._id, Number(e.target.value))}
                  className="cart-qty"
                />
                <button onClick={() => handleRemove(item._id)} className="remove-btn">
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="cart-summary">
        <h2>Tổng cộng: {totalPrice} VND</h2>
        <button className="checkout-btn">Thanh toán</button>
      </div>
    </div>
  );
};

export default Cart;
