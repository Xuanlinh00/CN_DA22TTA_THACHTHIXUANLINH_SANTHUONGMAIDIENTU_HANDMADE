import React, { useState } from "react";
import Layout from "../../components/jsx/Layout";
import "../css/CartPage.css";

const CartPage = () => {
  // Giỏ hàng mẫu (sau này sẽ lấy từ backend hoặc localStorage)
  const [cart, setCart] = useState([
    { _id: "1", name: "Vòng tay handmade", price: 120000, image: "https://via.placeholder.com/150", qty: 1 },
    { _id: "2", name: "Gốm sứ decor", price: 250000, image: "https://via.placeholder.com/150", qty: 2 },
  ]);

  const updateQty = (id, qty) => {
    setCart(cart.map(p => p._id === id ? { ...p, qty } : p));
  };

  const removeItem = (id) => {
    setCart(cart.filter(p => p._id !== id));
  };

  const total = cart.reduce((sum, p) => sum + p.price * p.qty, 0);

  return (
    <Layout>
      <section className="cart-page">
        <h2>🛍️ Giỏ Hàng</h2>
        {cart.length === 0 ? (
          <p>Giỏ hàng của bạn đang trống.</p>
        ) : (
          <>
            <div className="cart-grid">
              {cart.map((p) => (
                <div className="cart-item" key={p._id}>
                  <img src={p.image} alt={p.name} />
                  <div className="cart-info">
                    <h3>{p.name}</h3>
                    <p>{p.price}đ</p>
                    <input 
                      type="number" 
                      min="1" 
                      value={p.qty} 
                      onChange={(e) => updateQty(p._id, parseInt(e.target.value))}
                    />
                    <button onClick={() => removeItem(p._id)}>❌ Xóa</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-summary">
              <h3>Tổng cộng: {total}đ</h3>
              <a href="/checkout" className="btn-orange">Thanh Toán</a>
            </div>
          </>
        )}
      </section>
    </Layout>
  );
};

export default CartPage;
