import React, { useState } from "react";
import Layout from "../../components/jsx/Layout";
import "../css/Checkout.css";

const Checkout = () => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    payment: "cod",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("✅ Đặt hàng thành công! Cảm ơn bạn đã mua sắm tại CRAFTIFY.");
    // Sau này sẽ gửi dữ liệu form + giỏ hàng lên backend
  };

  return (
    <Layout>
      <section className="checkout">
        <h2>🧾 Thanh Toán</h2>
        <form className="checkout-form" onSubmit={handleSubmit}>
          <label>
            Họ và tên:
            <input 
              type="text" 
              name="name" 
              value={form.name} 
              onChange={handleChange} 
              required 
            />
          </label>
          <label>
            Số điện thoại:
            <input 
              type="text" 
              name="phone" 
              value={form.phone} 
              onChange={handleChange} 
              required 
            />
          </label>
          <label>
            Địa chỉ giao hàng:
            <textarea 
              name="address" 
              value={form.address} 
              onChange={handleChange} 
              required 
            />
          </label>
          <label>
            Phương thức thanh toán:
            <select 
              name="payment" 
              value={form.payment} 
              onChange={handleChange}
            >
              <option value="cod">Thanh toán khi nhận hàng (COD)</option>
              <option value="bank">Chuyển khoản ngân hàng</option>
              <option value="momo">Ví MoMo</option>
            </select>
          </label>
          <button type="submit" className="btn-orange">Xác nhận đặt hàng</button>
        </form>
      </section>
    </Layout>
  );
};

export default Checkout;
