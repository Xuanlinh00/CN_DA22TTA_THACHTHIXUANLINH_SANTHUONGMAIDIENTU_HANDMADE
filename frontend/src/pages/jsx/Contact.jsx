import React, { useState } from "react";
import "../css/Contact.css";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("http://localhost:5000/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert("Gửi liên hệ thành công!");
          setForm({ name: "", email: "", message: "" });
        } else {
          alert("Có lỗi xảy ra khi gửi liên hệ");
        }
      });
  };

  return (
    <div className="contact-container">
      <h2 className="page-title">Hỗ Trợ Khách Hàng</h2>
      <p>Liên hệ với chúng tôi qua hotline hoặc gửi tin nhắn trực tiếp:</p>
      <ul className="contact-info">
        <li>📞 Hotline: 0123 456 789</li>
        <li>📧 Email: support@craftify.vn</li>
      </ul>
      <form onSubmit={handleSubmit} className="contact-form">
        <input
          type="text"
          placeholder="Tên của bạn"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <textarea
          placeholder="Nội dung liên hệ"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
        <button type="submit" className="btn-orange">Gửi Liên Hệ</button>
      </form>
    </div>
  );
};

export default Contact;
