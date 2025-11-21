import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../components/css/AuthForm.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/auth/register", {
        name,
        email,
        password,
      });
      if (res.data.success) {
        alert("Đăng ký thành công!");
        navigate("/login");
      } else {
        alert("Đăng ký thất bại: " + res.data.message);
      }
    } catch (error) {
      alert("Lỗi đăng ký: " + error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>Đăng ký</h2>
      <form onSubmit={handleRegister} className="auth-form">
        <input
          type="text"
          placeholder="Họ và tên"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Đăng ký</button>
      </form>
      <p>
        Đã có tài khoản? <span onClick={() => navigate("/login")} className="auth-link">Đăng nhập</span>
      </p>
    </div>
  );
};

export default Register;
