import React, { useState } from 'react';
import './LoginPage.css'; 
import { Link } from 'react-router-dom';

const LoginPage = () => {
  //  Dùng 'useState' để lưu trữ email và password người dùng nhập
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  //  Hàm này sẽ được gọi khi người dùng nhấn nút "Đăng nhập"
  const submitHandler = async (e) => {
    e.preventDefault(); // Ngăn trình duyệt tải lại trang

    
    console.log('Đang gửi thông tin:', { email, password });
  };

  return (
    <div className="login-container">
      <h2>Đăng Nhập</h2>
      <form onSubmit={submitHandler}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Mật khẩu:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Đăng Nhập</button>
      </form>

      <div>
        <p>Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
      </div>
    </div>
  );
};

export default LoginPage;