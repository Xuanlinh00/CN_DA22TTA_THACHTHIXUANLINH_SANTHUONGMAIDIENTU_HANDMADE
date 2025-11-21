import React, { useState } from 'react';
import axios from 'axios';
import '../css/Login.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('/api/users/login', formData)
      .then(res => {
        alert('Đăng nhập thành công!');
        // lưu token hoặc chuyển hướng
      })
      .catch(err => alert('Đăng nhập thất bại!'));
  };

  return (
    <div className="login-container">
      <h1 className="login-title">Đăng nhập</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        <label>Email</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} required />

        <label>Mật khẩu</label>
        <input type="password" name="password" value={formData.password} onChange={handleChange} required />

        <button type="submit" className="login-btn">Đăng nhập</button>
      </form>
    </div>
  );
};

export default Login;
