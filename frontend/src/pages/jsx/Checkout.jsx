import React, { useState } from 'react';
import '../css/Checkout.css';

const Checkout = () => {
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    address: '',
    phone: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('VNPAY');

  const handleChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Gọi API tạo đơn hàng
    console.log('Thông tin giao hàng:', shippingInfo);
    console.log('Phương thức thanh toán:', paymentMethod);
    alert('Đặt hàng thành công!');
  };

  return (
    <div className="checkout-container">
      <h1 className="checkout-title">Thanh toán đơn hàng</h1>
      <form className="checkout-form" onSubmit={handleSubmit}>
        <label>Họ và tên</label>
        <input
          type="text"
          name="name"
          value={shippingInfo.name}
          onChange={handleChange}
          required
        />

        <label>Địa chỉ giao hàng</label>
        <input
          type="text"
          name="address"
          value={shippingInfo.address}
          onChange={handleChange}
          required
        />

        <label>Số điện thoại</label>
        <input
          type="text"
          name="phone"
          value={shippingInfo.phone}
          onChange={handleChange}
          required
        />

        <label>Phương thức thanh toán</label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="VNPAY">VNPAY</option>
          <option value="COD">Thanh toán khi nhận hàng (COD)</option>
        </select>

        <button type="submit" className="checkout-btn">Xác nhận đặt hàng</button>
      </form>
    </div>
  );
};

export default Checkout;
