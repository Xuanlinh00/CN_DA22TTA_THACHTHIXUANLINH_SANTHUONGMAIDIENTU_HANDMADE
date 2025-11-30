import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/jsx/Layout";
import "../css/Auth.css";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert("Đăng ký thành công! Vui lòng đăng nhập.");
          navigate("/login");
        } else {
          alert("Đăng ký thất bại!");
        }
      });
  };

  return (
    <Layout>
      <section className="auth">
        <h2>📝 Đăng Ký</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="text"
            placeholder="Họ và tên"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="user">Người dùng</option>
            <option value="vendor">Người bán</option>
          </select>
          <button type="submit" className="btn-orange">Đăng Ký</button>
        </form>
      </section>
    </Layout>
  );
};

export default Register;
