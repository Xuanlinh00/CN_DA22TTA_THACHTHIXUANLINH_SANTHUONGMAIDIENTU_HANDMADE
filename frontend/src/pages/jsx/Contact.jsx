import React, { useState } from 'react';
import '../css/Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Gọi API gửi liên hệ
    console.log('Thông tin liên hệ:', formData);
    alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm.');
  };

  return (
    <div className="contact-container">
      <h1 className="contact-title">Liên hệ với chúng tôi</h1>
      <div className="contact-content">
        {/* Form liên hệ */}
        <form className="contact-form" onSubmit={handleSubmit}>
          <label>Họ và tên</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Nội dung</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="5"
            required
          ></textarea>

          <button type="submit" className="contact-btn">Gửi liên hệ</button>
        </form>

        {/* Thông tin liên hệ */}
        <div className="contact-info">
          <h2>Thông tin cửa hàng</h2>
          <p>📍 Địa chỉ: 123 Đường ABC, Vĩnh Long</p>
          <p>📞 Số điện thoại: 0123 456 789</p>
          <p>✉️ Email: support@handmade-shop.com</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
