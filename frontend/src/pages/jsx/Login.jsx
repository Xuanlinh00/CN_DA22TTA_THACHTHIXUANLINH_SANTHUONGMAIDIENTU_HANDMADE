import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Layout from "../../components/jsx/Layout";
import "../css/Auth.css";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          login(data.user); // lưu user vào context
          alert("Đăng nhập thành công!");
          // chuyển hướng theo role
          if (data.user.role === "admin") navigate("/admin");
          else if (data.user.role === "vendor") navigate("/vendor");
          else navigate("/");
        } else {
          alert("Sai email hoặc mật khẩu!");
        }
      });
  };

  return (
    <Layout>
      <section className="auth">
        <h2>🔑 Đăng Nhập</h2>
        <form onSubmit={handleSubmit} className="auth-form">
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
          <button type="submit" className="btn-orange">Đăng Nhập</button>
        </form>
      </section>
    </Layout>
  );
};

export default Login;
